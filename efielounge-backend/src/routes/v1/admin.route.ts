import express from "express";
import { getMulterConfig } from "../../middlewares/menu.middleware";
import menuController from "../../controllers/v1/Admin/menu.controller";
import { decode, ensureAdmin } from "../../middlewares/jwt";
import accountController from "../../controllers/v1/Account/account.controller";

const adminRouter = express.Router();

adminRouter.post("/menu/create-menu", decode, ensureAdmin, getMulterConfig(), menuController.createMenu);
adminRouter.put("/menu/edit-menu", decode, ensureAdmin, menuController.editMenu);
adminRouter.patch("/menu/archive-menu", decode, ensureAdmin, menuController.archiveMenu);

adminRouter.post("/menu/create-menu-category", decode, ensureAdmin, menuController.createMenuCategory);
adminRouter.put("/menu/edit-menu-category", decode, ensureAdmin, menuController.editMenuCategory);
adminRouter.patch("/menu/archive-menu-category", decode, ensureAdmin, menuController.archiveMenuCategory);


adminRouter.post("/menu/create-menu-item", decode, ensureAdmin, getMulterConfig(), menuController.createMenuItem);
adminRouter.put("/menu/edit-menu-item", decode, ensureAdmin, menuController.editMenuItem);
adminRouter.patch("/menu/archive-menu-item", decode, ensureAdmin, menuController.archiveMenuItem);



adminRouter.post("/menu/create-menu-item-category", decode, ensureAdmin, menuController.createMenuItemCategory);
adminRouter.put("/menu/edit-menu-item-category", decode, ensureAdmin, menuController.editMenuItemCategory);
adminRouter.patch("/menu/archive-menu-item-category", decode, ensureAdmin, menuController.archiveMenuItemCategory);

adminRouter.get("/accounts/get-customers", decode, ensureAdmin, accountController.getCustomers);
adminRouter.get("/accounts/get-staff", decode, ensureAdmin, accountController.getStaff);


export default adminRouter;