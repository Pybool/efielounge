import Xrequest from "../../../interfaces/extensions.interface";
import { DashboardService } from "./dashboard.service";

export class TransactionService {
  static async fetchTransactions(req: Xrequest) {
    try {
      return await DashboardService.getTransactionsData(req);
    } catch (error: any) {
      throw error;
    }
  }
}
