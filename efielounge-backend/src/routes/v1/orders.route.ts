import express from "express";
import { decode, decodeExt } from "../../middlewares/jwt";
// import updateInCart from "../../middlewares/inCart.middleware";
import clientOrderController from "../../controllers/v1/Orders/orders.controller";


const orderRouter = express.Router();
orderRouter.get("/fetch-orders", decode, clientOrderController.fetchOrders);
orderRouter.patch("/rate-menu", decode, clientOrderController.rateMenu);

export default orderRouter;