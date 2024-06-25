import express from "express";
import clientMenuController from "../../controllers/v1/Menu/menu.controller";


const menuRouter = express.Router();

menuRouter.get("/fetch-menu", clientMenuController.getMenus);
menuRouter.get("/fetch-menu-item", clientMenuController.getMenuItems);
menuRouter.get("/fetch-menu-categories", clientMenuController.getMenuCategories);
menuRouter.get("/fetch-menu-detail", clientMenuController.fetchMenuDetail);
menuRouter.get("/fetch-menuitem-categories", clientMenuController.getMenuItemCategories);

export default menuRouter;