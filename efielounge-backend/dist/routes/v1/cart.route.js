"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = __importDefault(require("../../controllers/v1/Orders/cart.controller"));
const jwt_1 = require("../../middlewares/jwt");
const menu_middleware_1 = require("../../middlewares/menu.middleware");
const authMiddleware = jwt_1.decode;
const clientCartRouter = express_1.default.Router();
clientCartRouter.post("/add-to-cart", authMiddleware, cart_controller_1.default.addToCart);
clientCartRouter.get("/get-cart", authMiddleware, cart_controller_1.default.getCart);
clientCartRouter.patch("/remove-from-cart", authMiddleware, cart_controller_1.default.removeFromCart);
clientCartRouter.put("/update-cart", authMiddleware, cart_controller_1.default.updateCart);
clientCartRouter.put("/checkout", authMiddleware, cart_controller_1.default.checkOut);
clientCartRouter.post("/upload-receipt", authMiddleware, (0, menu_middleware_1.getMulterConfigSingle)(), cart_controller_1.default.uploadReceipt);
exports.default = clientCartRouter;
