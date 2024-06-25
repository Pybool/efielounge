import express from "express";
import { getMulterConfig } from "../../middlewares/menu.middleware";
import menuController from "../../controllers/v1/Admin/menu.controller";
import { decode, ensureAdmin } from "../../middlewares/jwt";
import accountController from "../../controllers/v1/Account/account.controller";

const adminRouter = express.Router();

adminRouter.post("/menu/create-menu", decode, ensureAdmin, getMulterConfig(), menuController.createMenu);
adminRouter.post("/menu/create-menu-category", decode, ensureAdmin, menuController.createMenuCategory);
adminRouter.post("/menu/create-menu-item", decode, ensureAdmin, getMulterConfig(), menuController.createMenuItem);
adminRouter.post("/menu/create-menu-item-category", decode, ensureAdmin, menuController.createMenuItemCategory);

adminRouter.get("/accounts/get-customers", decode, ensureAdmin, accountController.getCustomers);
adminRouter.get("/accounts/get-staff", decode, ensureAdmin, accountController.getStaff);


export default adminRouter;