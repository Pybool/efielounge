import express from "express";
import clientMenuController from "../../controllers/v1/Menu/menu.controller";
import { OrderService } from "../../services/v1/orders/orders.service";
import { decode, decodeExt } from "../../middlewares/jwt";
import updateInCart from "../../middlewares/inCart.middleware";


const menuRouter = express.Router();

menuRouter.get("/fetch-menu", decodeExt, updateInCart, clientMenuController.getMenus);
menuRouter.get("/fetch-menu-item", clientMenuController.getMenuItems);
menuRouter.get("/fetch-menu-categories", clientMenuController.getMenuCategories);
menuRouter.get("/fetch-menu-detail", clientMenuController.fetchMenuDetail);
menuRouter.get("/fetch-menuitem-categories", clientMenuController.getMenuItemCategories);
menuRouter.patch("/like-menu", decode, clientMenuController.likeMenu);
menuRouter.get("/get-user-favourites", decode, updateInCart, (async(req:any, res:any,next:any)=>{
    const result = await OrderService.getMostOrdered(req)
    res.status(result?.code || 500).json(result)
}));

menuRouter.get("/get-most-popular-menu", decode, updateInCart, (async(req:any, res:any,next:any)=>{
    const result = await OrderService.getMostOrdered(req)
    res.status(result?.code || 500).json(result)
}));



export default menuRouter;