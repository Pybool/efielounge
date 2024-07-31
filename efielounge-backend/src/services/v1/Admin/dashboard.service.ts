import Xrequest from "../../../interfaces/extensions.interface";
import { Ipromotion } from "../../../interfaces/promotions.interface";
import Accounts from "../../../models/Accounts/accounts.model";
import CheckOut from "../../../models/Checkout/checkoutIntent.model";
import Order from "../../../models/Orders/order.model";
import Promotions from "../../../models/promotions.model";
import Transaction from "../../../models/transactions/transactions.model";
import validations from "../../../validators/admin/promotions.validator";

// Function to format the number into abbreviated form (K, M, B)
function formatNumber(num: number) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toFixed(0);
}

export class DashboardService {
  private static async getUsersData(req: Xrequest) {
    try {
      const filter = { role: "CUSTOMER" };
      const usersCount = await Accounts.countDocuments(filter);
      return formatNumber(usersCount);
    } catch (error: any) {
      return 0;
    }
  }

  private static async getIncomeData(req: Xrequest) {
    try {
      let transactions: any = await Transaction.find({})
        .select("transaction")
        .lean();
      transactions = JSON.parse(JSON.stringify(transactions));
      //   console.log(transactions)
      const totalAmount = transactions.reduce(
        (acc: any, transaction: { transaction: { data: { amount: any } } }) =>
          acc + transaction.transaction.data.amount,
        0
      );
      // Format the total amount
      const formattedTotalAmount = formatNumber(totalAmount);
      return formattedTotalAmount;
    } catch (error: any) {
      throw error;
    }
  }

  private static async getOrdersData(req: Xrequest) {
    try {
      const ordersCount = await Order.countDocuments({});
      const completedOrders: number = await Order.countDocuments({
        status: "DELIVERED",
      });
      return {
        ordersCount: formatNumber(ordersCount),
        completedOrders: formatNumber(completedOrders),
      };
    } catch (error: any) {
      return { ordersCount: 0, completedOrders: 0 };
    }
  }

  public static async getTransactionsData(req: Xrequest) {
    try {
      const page = Number((req.query.page! as string) || 1);
      const limit = Number((req.query.limit! as string) || 20);

      // Calculate skip value based on page and limit
      const skip = (page - 1) * limit;

      // Count total documents
      const total = await Transaction.countDocuments({});

      // Fetch transactions with pagination
      let transactions: any = await Transaction.find({})
        .sort({ createdAt: -1 }) // Sort by _id in descending order (optional)
        .skip(skip)
        .limit(limit);

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      transactions = JSON.parse(JSON.stringify(transactions));

      for (let transaction of transactions) {
        let account = null;
        const checkOutItem = await CheckOut.findOne({
          checkOutId: transaction.checkOutId,
        }).select("account");
        if (checkOutItem) {
          account = await Accounts.findOne({ _id: checkOutItem.account });
        }
        transaction.account = account;
      }

      return {
        status: true,
        total,
        totalPages,
        page,
        limit: limit,
        data: transactions, // Rename "data" to "transactions" for clarity
      };
    } catch (error: any) {
      return {
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
        data: [], // Rename "data" to "transactions" for clarity
      };
    }
  }

  public static async fecthDashBoardData(req: Xrequest) {
    try {
      const usersData = await DashboardService.getUsersData(req);
      const incomeData = await DashboardService.getIncomeData(req);
      const ordersData = await DashboardService.getOrdersData(req);
      const recentTransactions = await DashboardService.getTransactionsData(
        req
      );
      return {
        status: true,
        data: {
          usersData,
          incomeData,
          ordersData,
          recentTransactions,
        },
        message: "Dashboard data was fetched successfully",
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
