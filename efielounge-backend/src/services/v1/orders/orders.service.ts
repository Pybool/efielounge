import mongoose, { Types } from "mongoose";
import Cart from "../../../models/Orders/cart.model";
import Order from "../../../models/Orders/order.model";
import Xrequest from "../../../interfaces/extensions.interface";
import Menu from "../../../models/menu/menu.model";
import CheckOut from "../../../models/Checkout/checkoutIntent.model";
import mailActions from "../Mail/mail.service";
import Accounts from "../../../models/Accounts/accounts.model";
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
      const account = await Accounts.findOne({ _id: checkOutIntent.account })!;
      if (account) {
        mailActions.orders.sendOrderConfirmationMail(
          account!.email as string,
          checkOutIntent.checkOutId
        );
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
      let populatedUserTopOrderedMenu;
      let populatedOverallTopOrderedMenu;

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

      if (accountId) {
        return {
          status: true,
          data: populatedUserTopOrderedMenu,
          code: 200,
        };
      }

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
        const checkOut = await CheckOut.findOne({ checkOutId: checkOutId });
        const date = groupedOrders[checkOutId][0]?.createdAt;
        return {
          checkOutId,
          orders,
          date,
          grandTotal: checkOut ? checkOut.amount : 0, // or another default value if not found
        };
      })
    );

    return collapsedOrders;
  }

  static async fetchOrders(req: Xrequest) {
    try {
      let filter: any = {};
      const page = Number((req.query.page! as string) || 1);
      const limit = Number((req.query.limit! as string) || 20);

      filter = OrderService.buildFilter(req);
      const options = {
        page: page,
        limit: limit,
        sort: {},
      };

      const [orders, total] = await Promise.all([
        Order.find(filter, null, options)
          .sort({ createdAt: -1 })
          .populate("menu")
          .populate("customMenuItems"),
        Order.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);
      // for (const order of orders) {
      //   order.ratings = await Order.computeRating(order._id.toString());
      //   order.likes = await Order.countDocuments({ menuId: menu._id });
      // }
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

  static buildFilter(req: Xrequest) {
    try {
      if (req.query.filter) {
        if (req.query.field == "status") {
          return { status: req.query.filter };
        } else if (req.query.field == "category") {
          return { category: new Types.ObjectId(req.query.filter as string) };
        }
      }
      return { account: req.accountId! };
    } catch {
      return { account: req.accountId! };
    }
  }
}
