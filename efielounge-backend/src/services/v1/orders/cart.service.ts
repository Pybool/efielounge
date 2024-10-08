import { addTransactionSupport } from "ioredis/built/transaction";
import Xrequest from "../../../interfaces/extensions.interface";
import Accounts from "../../../models/Accounts/accounts.model";
import CheckOut from "../../../models/Checkout/checkoutIntent.model";
import OrderSequence from "../../../models/Checkout/orderSequence.model";
import Menu from "../../../models/menu/menu.model";
import Cart from "../../../models/Orders/cart.model";
import PaymentProof from "../../../models/transactions/paymentProofs.model";
import { OrderService } from "./orders.service";
import Transaction from "../../../models/transactions/transactions.model";
import mailActions from "../Mail/mail.service";

function formatDate(isoString: string) {
  const date = new Date(isoString);
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function validateEmail(email:string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

export class CartService {
  static async addToCart(req: Xrequest) {
    try {
      const cartPayload = req.body;
      const menu = await Menu.findOne({ _id: cartPayload.menu });
      const account = await Accounts.findOne({
        _id: req.accountId,
      });
      console.log("account ", account);
      if (!account) {
        return {
          status: false,
          message: "No such user account was found",
          code: 404,
        };
      }
      if (!menu) {
        return {
          status: false,
          message: "No such menu was found",
          code: 404,
        };
      }
      if (!Number.isInteger(cartPayload?.units)) {
        return {
          status: false,
          message: "Units must be a valid integer",
          code: 400,
        };
      }

      if (cartPayload?.units > 10) {
        return {
          status: false,
          message: "You cannot order more than 10 units",
          code: 400,
        };
      }
      // const exists = await Cart.findOne({
      //   account: req.accountId,
      //   menu: cartPayload.menu,
      // });
      // if (!exists) {
      cartPayload.account = account._id;
      cartPayload.createdAt = new Date();
      const cartItem = await Cart.create(cartPayload);
      const cartData = await cartItem.populate("customMenuItems");
      cartData._id = cartItem._id;
      return {
        status: true,
        message: "Menu added to cart succesfully",
        isMerged: false,
        data: await cartData.populate({
          path: "menu",
          populate: { path: "menuItems" },
        }),
        code: 200,
      };
      // }
      // exists.updatedAt = new Date();
      // exists.units = exists.units + cartPayload.units;
      // const mergedMenu = await exists.save();
      // return {
      //   status: true,
      //   message: "Merged menu units in your cart",
      //   isMerged: true,
      //   data: mergedMenu,
      //   code: 200,
      // };
    } catch (error: any) {
      throw error;
    }
  }

  static async getCart(req: Xrequest) {
    try {
      let cart;
      const checkOutId = req.query.checkOutId! as string;
      if (checkOutId.startsWith("EF")) {
        const checkOutIntent = await CheckOut.findOne({
          checkOutId: checkOutId,
        });
        if (checkOutIntent) {
          cart = await Cart.find({
            account: req.accountId,
            _id: { $in: checkOutIntent.cart }, // Optimized filter
          })
            .sort({ createdAt: -1 }) // Sort by creation date (most recent first)
            .populate("account") // Populate account data
            .populate("menu")
            .populate({ path: "menu", populate: { path: "menuItems" } })
            .populate("customMenuItems");
        } else {
          return {
            status: false,
            message: `No checkout intent was found for checkoutId ${checkOutId}`,
            code: 404,
          };
        }
      } else {
        cart = await Cart.find({
          account: req.accountId,
        })
          .sort({ createdAt: -1 })
          .populate("account")
          .populate("menu")
          .populate({ path: "menu", populate: { path: "menuItems" } })
          .populate("customMenuItems");
      }
      return {
        status: true,
        message: "Cart successfully fetched",
        data: cart,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async removeFromCart(req: Xrequest) {
    try {
      const { cartItemId } = req.body;
      const account = await Accounts.findOne({
        _id: req.accountId,
      });
      if (!account) {
        return {
          status: false,
          message: "No such user account was found",
          code: 404,
        };
      }
      const cartItem = await Cart.findOne({
        account: req.accountId,
        _id: cartItemId,
      });
      if (!cartItem) {
        return {
          status: false,
          message: "Cart Item was not found in cart",
          code: 404,
        };
      }
      await Cart.findOneAndDelete({
        account: req.accountId,
        _id: cartItemId,
      });
      //If a cart item is removed delete its checkoutIntent
      // await CheckOut.findOneAndDelete({ account: req.accountId });

      return {
        status: true,
        message: "Cart item successfully removed",
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async dumpCart(req: Xrequest) {
    try {
      const userId = req.accountId;
      await Cart.deleteMany({ account: userId });
      return {
        status: true,
        message: "Cart deleted succesfully",
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async updateCart(req: Xrequest) {
    try {
      const cartItemId = req.body?.cartItemId! as string;
      const units = req.body?.units! as number;
      const customMenuItems = req.body?.customMenuItems as any;
      const cartItem = await Cart.findOne({
        account: req.accountId,
        _id: cartItemId,
      });
      if (!cartItem) {
        return {
          status: false,
          message: "Cart Item was not found in cart",
          code: 404,
        };
      }

      if (units && !Number.isInteger(units)) {
        return {
          status: false,
          message: "Units must be a valid integer",
          code: 400,
        };
      } else {
        cartItem.units = units;
      }

      if (customMenuItems) {
        cartItem.customMenuItems = customMenuItems;
      } else {
        cartItem.customMenuItems = null;
      }

      const updatedCart = await cartItem.save();
      return {
        status: true,
        message: "Cart was upated",
        data: updatedCart,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async checkOut(req: Xrequest) {
    try {
      const { cartItems, amount, addressId } = req.body!;
      const checkOutId = req.query.checkOutId! as string;
      if (checkOutId) {
        if (!checkOutId?.startsWith("EF-")) {
          return {
            status: false,
            message: "Invalid Checkout ID",
            code: 400,
          };
        }
      }

      const cartItemIds = [];
      for (let cartItem of cartItems) {
        cartItemIds.push(cartItem._id);
        const cartItemDb = await Cart.findOne({ _id: cartItem._id });

        const selectedCustomMenuItems = [];
        for (let customMenuItem of cartItem.customMenuItems) {
          if (customMenuItem.isFinalSelect == true) {
            selectedCustomMenuItems.push(customMenuItem);
          }
        }

        if (cartItemDb) {
          cartItemDb.customMenuItems = selectedCustomMenuItems;
          cartItemDb.units = cartItem.units;
          cartItemDb.total = cartItem.total;
          await cartItemDb.save();
        } else {
          return {
            status: false,
            message: "A cartItem was not found in records",
            code: 404,
          };
        }
      }
      let checkOutIntent = await CheckOut.findOne({
        account: req.accountId,
        isActive: true,
      });

      console.log("Existing checkOutIntent ", checkOutIntent);

      if (!checkOutIntent) {
        // await CheckOut.findOneAndDelete({ account: req.accountId });
        const newCheckOutId = await CartService.generateCheckOutId();
        checkOutIntent = await CheckOut.create({
          checkOutId: newCheckOutId,
          cart: cartItemIds,
          account: req.accountId,
          amount: amount,
          address: addressId,
        });
      } else {
        checkOutIntent = await CheckOut.findOneAndUpdate(
          { account: req.accountId, isActive: true },
          {
            cart: cartItemIds,
            account: req.accountId,
            amount: amount,
            checkOutId: checkOutId,
            address: addressId,
          }
          // { new: true }
        );
        if (checkOutIntent?.cart.length == 0) {
          await CheckOut.findOneAndDelete({ account: req.accountId });
        }
      }
      return {
        status: true,
        message: "Checking out was successful",
        data: checkOutIntent,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async generateCheckOutId() {
    try {
      const sequenceDoc = await OrderSequence.findOneAndUpdate(
        {}, // Empty filter to update the single sequence document
        { $inc: { sequence: 1 } }, // Increment the sequence counter
        { new: true, upsert: true } // Return the updated document, create if not found
      );
      const sequence: any = String(sequenceDoc.sequence).padStart(6, "0"); // Format with leading zeros
      const checksum = sequence % 10; // Simple modulo 10 checksum

      const orderId = `EF-${sequence}${checksum}`; // Prepend prefix and checksum

      return orderId;
    } catch (error) {
      console.error("Error generating order ID:", error);
      throw error; // Re-throw the error for further handling
    }
  }

  static async uploadReceipt(req: Xrequest) {
    try {
      const attachments = req.attachments;
      const requestBody = req.body;
      const ref = requestBody.ref;
      console.log("REF ", ref, req.accountId, req.attachments, attachments);

      let checkOutIntent = await CheckOut.findOne({
        account: req.accountId,
        checkOutId: ref,
      });

      if (!checkOutIntent) {
        return {
          status: false,
          message: "No such payment reference exists on your account",
          code: 404,
        };
      }

      if (attachments?.length == 0) {
        return {
          status: false,
          message: "No valid images were sent",
          data: null,
          code: 400,
        };
      }

      const proof = await PaymentProof.create({ checkOutId: ref, attachments });
      const checkOutIntentMod = {
        account: checkOutIntent.account,
        checkOutId: checkOutIntent.checkOutId,
        cart: checkOutIntent.cart,
        status: checkOutIntent.status,
      };
      await OrderService.createOrder(checkOutIntentMod);
      await CheckOut.findOneAndUpdate(
        { account: req.accountId, isActive: true },
        { isActive: false },
        { new: true }
      );
      // await CheckOut.findOneAndDelete({ account: req.accountId });

      return {
        status: true,
        data: proof,
        message: "Receipt uploaded successfully",
        code: 201,
      };
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  static async saveTransaction(req: Xrequest) {
    try {
      const payload = req.body;
      payload.createdAt = new Date();
      let checkOutIntent = await CheckOut.findOne({
        account: req.accountId,
        checkOutId: payload.checkOutId,
      });

      if (!checkOutIntent) {
        return {
          status: false,
          message: "No such payment reference exists on your account",
          code: 404,
        };
      }
      const checkOutIntentMod = {
        account: checkOutIntent.account,
        checkOutId: checkOutIntent.checkOutId,
        cart: checkOutIntent.cart,
        status: checkOutIntent.status,
      };
      const orders: any = await OrderService.createOrder(checkOutIntentMod);
      const transaction = await Transaction.create(payload);
      let checkoutData: any = await CheckOut.findOneAndUpdate(
        { account: req.accountId, isActive: true },
        { isActive: false },
        { new: true }
      );
      checkoutData = await checkoutData?.populate("cart");
      checkoutData = await checkoutData?.populate("account");
      checkoutData = await checkoutData?.populate("address");
      if(validateEmail(checkoutData.account.email)){
        await CartService.generateReceipt(
          transaction,
          checkoutData,
          orders
        );
      }
      
      return {
        status: true,
        message: "Transaction created & saved",
        data: transaction,
        code: 201,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async generateReceipt(
    transaction: any,
    checkoutData: any,
    orders: any[]
  ) {
    const email: string = checkoutData.account.email;
    const date: string = formatDate(new Date().toLocaleString());
    const orderId: string = transaction.checkOutId;
    const name: string = `${checkoutData.account.firstName} ${checkoutData.account.lastName}`;
    const deliveryAddress = checkoutData.address;
    const amountPaid: number = transaction?.transaction?.data?.amount;
    const paymentChannel: string =
      transaction?.transaction?.data?.channel?.replaceAll("_", " ");
    const currency: string = transaction?.transaction?.data.currency;
    const status: string = transaction?.transaction?.data.status;

    let polulatedOrders = [];
    for (let order of orders) {
      let tempOrder = await order.populate("variants");
      tempOrder = await tempOrder.populate("customMenuItems");
      tempOrder = await tempOrder.populate("menu");
      polulatedOrders.push(tempOrder);
    }
    const metaData = {
      date,
      orderId,
      email,
      name,
      deliveryAddress,
      amountPaid,
      paymentChannel,
      currency,
      status,
    };
    mailActions.orders.sendReceiptMail(metaData?.email, metaData, polulatedOrders);
    return { metaData, polulatedOrders };
  }

  static async getCheckOut(req: Xrequest) {
    try {
      const checkOutId = req.query.checkOutId! as string;
      if (checkOutId.startsWith("EF")) {
        const checkOutIntent = await CheckOut.findOne({
          checkOutId: checkOutId,
        });
        if (checkOutIntent) {
          return {
            status: true,
            message: "Checkout was fetched succesfully",
            data: checkOutIntent,
            code: 200,
          };
        }
        return {
          status: false,
          message: "Checkout Id Not found",
          code: 400,
        };
      } else {
        return {
          status: false,
          message: "Invalid checkout id",
          code: 400,
        };
      }
    } catch (error: any) {
      throw error;
    }
  }
}
