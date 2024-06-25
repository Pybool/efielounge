import express from "express";
import clientCartController from "../../controllers/v1/Orders/cart.controller";
import { decode } from "../../middlewares/jwt";
import { getMulterConfigSingle } from "../../middlewares/menu.middleware";
const authMiddleware = decode
const clientCartRouter = express.Router();

clientCartRouter.post("/add-to-cart", authMiddleware, clientCartController.addToCart);
clientCartRouter.get("/get-cart", authMiddleware, clientCartController.getCart);
clientCartRouter.patch("/remove-from-cart", authMiddleware, clientCartController.removeFromCart);
clientCartRouter.put("/update-cart", authMiddleware, clientCartController.updateCart);
clientCartRouter.put("/checkout", authMiddleware, clientCartController.checkOut);

clientCartRouter.post("/upload-receipt", authMiddleware, getMulterConfigSingle('../efielounge-backend/public/receipts/'), clientCartController.uploadReceipt);



export default clientCartRouter;