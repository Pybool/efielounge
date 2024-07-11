"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_1 = require("../../middlewares/jwt");
// import updateInCart from "../../middlewares/inCart.middleware";
const orders_controller_1 = __importDefault(require("../../controllers/v1/Orders/orders.controller"));
const orderRouter = express_1.default.Router();
orderRouter.get("/fetch-orders", jwt_1.decode, orders_controller_1.default.fetchOrders);
orderRouter.patch("/rate-menu", jwt_1.decode, orders_controller_1.default.rateMenu);
exports.default = orderRouter;
