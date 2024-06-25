"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menu_middleware_1 = require("../../middlewares/menu.middleware");
const menu_controller_1 = __importDefault(require("../../controllers/v1/Admin/menu.controller"));
const adminRouter = express_1.default.Router();
adminRouter.post("/menu/create-menu", (0, menu_middleware_1.getMulterConfig)(), menu_controller_1.default.createMenu);
adminRouter.post("/menu/create-menu-category", menu_controller_1.default.createMenuCategory);
adminRouter.post("/menu/create-menu-item", (0, menu_middleware_1.getMulterConfig)(), menu_controller_1.default.createMenuItem);
adminRouter.post("/menu/create-menu-item-category", menu_controller_1.default.createMenuItemCategory);
exports.default = adminRouter;
