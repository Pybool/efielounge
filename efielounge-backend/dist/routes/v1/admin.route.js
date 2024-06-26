"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menu_middleware_1 = require("../../middlewares/menu.middleware");
const menu_controller_1 = __importDefault(require("../../controllers/v1/Admin/menu.controller"));
const jwt_1 = require("../../middlewares/jwt");
const account_controller_1 = __importDefault(require("../../controllers/v1/Account/account.controller"));
const adminRouter = express_1.default.Router();
adminRouter.post("/menu/create-menu", jwt_1.decode, jwt_1.ensureAdmin, (0, menu_middleware_1.getMulterConfig)(), menu_controller_1.default.createMenu);
adminRouter.post("/menu/create-menu-category", jwt_1.decode, jwt_1.ensureAdmin, menu_controller_1.default.createMenuCategory);
adminRouter.post("/menu/create-menu-item", jwt_1.decode, jwt_1.ensureAdmin, (0, menu_middleware_1.getMulterConfig)(), menu_controller_1.default.createMenuItem);
adminRouter.post("/menu/create-menu-item-category", jwt_1.decode, jwt_1.ensureAdmin, menu_controller_1.default.createMenuItemCategory);
adminRouter.get("/accounts/get-customers", jwt_1.decode, jwt_1.ensureAdmin, account_controller_1.default.getCustomers);
adminRouter.get("/accounts/get-staff", jwt_1.decode, jwt_1.ensureAdmin, account_controller_1.default.getStaff);
exports.default = adminRouter;
