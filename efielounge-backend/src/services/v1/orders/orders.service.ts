import mongoose, { Types } from "mongoose";
import Cart from "../../../models/Orders/cart.model";
import Order from "../../../models/Orders/order.model";
import Xrequest from "../../../interfaces/extensions.interface";
import Menu from "../../../models/menu/menu.model";
import CheckOut from "../../../models/Checkout/checkoutIntent.model";
import mailActions from "../Mail/mail.service";
import Accounts from "../../../models/Accounts/accounts.model";
import MenuRatings from "../../../models/menu/ratings.model";
import { Menuservice } from "../menu/menu.service";
import MenuLikes from "../../../models/menu/likes.model";

async function checkIfIRated(account: string, menuId: string) {
  const exists = await MenuRatings.findOne({ account, menu: menuId })!;
  if (exists?.menu!.toString() === menuId.toString()) {
    return true;
  }
  return false;
}

export class OrderService {
  static async createOrder(checkOutIntent: any) {
    try {
      console.log(checkOutIntent);

      const cartIds = checkOutIntent.cart.map(
        (itemId: any) => new mongoose.Types.ObjectId(itemId)
      );

      const cartItems: any = await Cart.find({ _id: { $in: cartIds } })
        .select("-_id -__v")
        .lean();

      const savedOrders = [];

      for (const cartitem of cartItems) {
        cartitem.createdAt = new Date();
        cartitem.checkOutId = checkOutIntent.checkOutId;

        try {
          const order = await Order.create(cartitem);
          console.log("Created", order);
          savedOrders.push(order._id);
        } catch (error) {
          console.error("Error creating order:", error);

          // Rollback logic:
          // 1. Identify orders to rollback (created before the error):
          const ordersToRollback = savedOrders.slice(); // Copy saved orders array

          // 2. Loop backwards to avoid order deletion issues:
          for (let i = ordersToRollback.length - 1; i >= 0; i--) {
            const orderId = ordersToRollback[i];
            await Order.deleteOne({ _id: orderId });
            console.warn(`Order ${orderId} rolled back due to error.`);
          }

          // 3. Re-throw the error to stop further processing:
          throw error;
        }
      }
      const deletedCount = await Cart.deleteMany({ _id: { $in: cartIds } });
      console.log(`Deleted ${deletedCount} cart items.`);

      console.log("All orders created successfully!");
      const account:any = await Accounts.findOne({ _id: checkOutIntent.account })!;
      if (account) {
        if (account?.email.includes("@")) {
          mailActions.orders.sendOrderSuccessfulMail(
            account!.email as string,
            checkOutIntent.checkOutId
          );
        }
      }
    } catch (error) {
      console.error("Overall error:", error);
    }
  }

  static async getMostOrdered(req: Xrequest) {
    const accountId = req.accountId!;
    try {
      // Fetch all orders for the user
      let userOrders;
      let allOrders;
      let populatedUserTopOrderedMenu: any = [];
      let populatedOverallTopOrderedMenu: any = [];

      if (accountId) {
        userOrders = await Order.find({ account: accountId })
          .populate("menu")
          .exec();
      } else {
        // Fetch all orders for overall statistics
        allOrders = await Order.find().populate("menu").exec();
      }

      // Function to get top 3 most ordered menu items from a list of orders
      const getTopMostOrderedMenu: any = (orders: any[], limit: number = 3) => {
        const menuCount: { [key: string]: { count: number; menu: any } } = {};

        orders.forEach((order) => {
          const menuId = order.menu._id.toString();
          if (!menuCount[menuId]) {
            menuCount[menuId] = { count: 0, menu: order.menu };
          }
          menuCount[menuId].count++;
        });

        const sortedMenuItems = Object.values(menuCount).sort(
          (a, b) => b.count - a.count
        );
        const topMenuItems = sortedMenuItems.slice(0, limit);

        return topMenuItems.map((item) => item.menu);
      };

      // Populate the menuItems field for the top menu items
      if (accountId) {
        const userTopOrderedMenu = getTopMostOrderedMenu(userOrders);
        populatedUserTopOrderedMenu = await Menu.populate(userTopOrderedMenu, [
          { path: "menuItems" },
          { path: "category" },
        ]);
      } else {
        const overallTopOrderedMenu: any = getTopMostOrderedMenu(allOrders, 4);
        populatedOverallTopOrderedMenu = await Menu.populate(
          overallTopOrderedMenu,
          [{ path: "menuItems" }, { path: "category" }]
        );
      }

      const rateAndLike = async (arr: any[]) => {
        for (const menu of arr!) {
          menu.ratings = await Menuservice.computeRating(menu._id.toString());
          menu.likes = await MenuLikes.countDocuments({ menuId: menu._id });
        }
      };

      if (accountId) {
        await rateAndLike(populatedUserTopOrderedMenu);
        return {
          status: true,
          data: populatedUserTopOrderedMenu,
          code: 200,
        };
      }
      await rateAndLike(populatedOverallTopOrderedMenu);
      return {
        status: true,
        data: populatedOverallTopOrderedMenu,
        code: 200,
      };
    } catch (error) {
      console.error("Error getting most ordered items:", error);
      throw error; // Or handle the error differently
    }
  }

  static async collapseOrders(orders: any[]) {
    const groupedOrders = orders.reduce((acc, order) => {
      const checkOutId = order.checkOutId;
      acc[checkOutId] = acc[checkOutId] || []; // Initialize array if not existing
      acc[checkOutId].push(order);
      return acc;
    }, {});

    const collapsedOrders = await Promise.all(
      Object.entries(groupedOrders).map(async ([checkOutId, orders]) => {
        const checkOut = await CheckOut.findOne({
          checkOutId: checkOutId,
          isActive: false,
        })!.populate("address");
        const date = groupedOrders[checkOutId][0]?.createdAt;
        if (checkOut) {
          return {
            checkOutId,
            orders,
            date,
            grandTotal: checkOut ? checkOut.amount : 0,
            status: checkOut!.status,
            notes: checkOut!.notes || "",
            deliveryAddress: checkOut.address,
            readyIn: checkOut?.readyIn || null,
            readyInSetAt: checkOut?.readyInSetAt,
          };
        } else {
          return {
            checkOutId,
            orders,
            date,
            grandTotal: 0,
            status: "",
            notes: "",
          };
        }
      })
    );

    return collapsedOrders;
  }

  static async computeRating(menu: string) {
    try {
      const ratings = await MenuRatings.find({ menu });

      if (ratings.length === 0) {
        return 0;
      }

      const totalRating = ratings.reduce(
        (acc, rating: any) => acc + rating.rating,
        0
      );
      const averageRating = totalRating / ratings.length;
      return averageRating;
    } catch (error) {
      return 0;
    }
  }

  static async rateMenu(req: Xrequest) {
    try {
      const data = req.body!;
      const canRate: any = await Order.findOne({
        account: req.accountId!,
        menu: data.menu,
      }).populate("menu");
      if (!canRate) {
        return {
          status: false,
          message: "You cannot rate a product you have no bought",
          code: 400,
        };
      }
      data.account = req.accountId!;
      const rating = await MenuRatings.create(data);
      rating.rating = await Menuservice.computeRating(
        canRate?.menu._id.toString()
      );
      return {
        status: true,
        message: `Thank you for rating ${canRate?.menu?.name}`,
        data: await rating.populate("menu"),
        code: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  static async fetchOrders(req: Xrequest) {
    try {
      let filter: any = {};
      const page = Number((req.query.page! as string) || 1);
      const limit = Number((req.query.limit! as string) || 100);

      filter = OrderService.buildFilter(req);
      console.log("Filter ", filter);
      const skip = (page - 1) * limit; // Calculate the number of documents to skip

      const options = {
        skip: skip, // Skip the appropriate number of documents for pagination
        limit: limit, // Limit the number of documents returned
        sort: {}, // Sort by createdAt in descending order
      };

      const [orders, total]: any = await Promise.all([
        Order.find(filter, null, options)
          .sort({ createdAt: -1 })
          .populate({
            path: "menu",
            populate: {
              path: "menuItems",
            },
          })
          .populate("customMenuItems")
          .populate("account"),
        Order.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);
      for (const order of orders) {
        order.menu.ratings = await OrderService.computeRating(
          order.menu._id.toString()
        );
        order.menu.likes = await Order.countDocuments({ menu: order.menu._id });
        order.menu.iRated = await checkIfIRated(req.accountId!, order.menu._id);
      }
      return {
        status: true,
        data: await OrderService.collapseOrders(orders),
        total: total,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        message: "Orders were fetched successfully",
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async updateOrderStatus(req: Xrequest) {
    try {
      const data = JSON.parse(JSON.stringify(req.body));
      const checkOutId = data.checkOutId;
      if (data.setReady) {
        data.readyInSetAt = new Date();
        delete data.setReady;
      }
      let result: any = await CheckOut.findOneAndUpdate(
        { checkOutId: checkOutId },
        data,
        { new: true }
      )!;
      if (result) {
        result = await result.populate("account");
      }
      delete data.notes;
      result = JSON.parse(JSON.stringify(result));

      await Order.findOneAndUpdate({ checkOutId: checkOutId }, data, {
        new: true,
      })!;
      if (result) {
        if (req.body.setReady && result.status! !== "PENDING") {
          mailActions.orders.sendOrderUpdateMail(
            result.account?.email,
            result.status!,
            checkOutId
          );
        }

        return {
          status: true,
          message: "Order status was updated",
          code: 200,
        };
      }
      return {
        status: false,
        message: "Order could not be updated",
        code: 400,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static buildFilter(req: Xrequest) {
    try {
      if (req.query.filter) {
        if (req.query.filter != "all") {
          return { status: req.query.filter };
        }
        if (req.query.filter == "all") {
          return {};
        }
      }

      return { account: req.accountId! };
    } catch {
      return { account: req.accountId! };
    }
  }
}
