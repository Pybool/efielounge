"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menu_controller_1 = __importDefault(require("../../controllers/v1/Menu/menu.controller"));
const menuRouter = express_1.default.Router();
menuRouter.get("/fetch-menu", menu_controller_1.default.getMenus);
menuRouter.get("/fetch-menu-item", menu_controller_1.default.getMenuItems);
menuRouter.get("/fetch-menu-categories", menu_controller_1.default.getMenuCategories);
menuRouter.get("/fetch-menu-detail", menu_controller_1.default.fetchMenuDetail);
menuRouter.get("/fetch-menuitem-categories", menu_controller_1.default.getMenuItemCategories);
exports.default = menuRouter;
