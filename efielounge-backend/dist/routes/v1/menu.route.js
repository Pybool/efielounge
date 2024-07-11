"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menu_controller_1 = __importDefault(require("../../controllers/v1/Menu/menu.controller"));
const orders_service_1 = require("../../services/v1/orders/orders.service");
const jwt_1 = require("../../middlewares/jwt");
const inCart_middleware_1 = __importDefault(require("../../middlewares/inCart.middleware"));
const search_service_1 = require("../../services/v1/menu/search.service");
const menuRouter = express_1.default.Router();
menuRouter.get("/fetch-menu", jwt_1.decodeExt, inCart_middleware_1.default, menu_controller_1.default.getMenus);
menuRouter.get("/fetch-menu-item", menu_controller_1.default.getMenuItems);
menuRouter.get("/fetch-menu-categories", menu_controller_1.default.getMenuCategories);
menuRouter.get("/fetch-menu-detail", menu_controller_1.default.fetchMenuDetail);
menuRouter.get("/fetch-menuitem-categories", menu_controller_1.default.getMenuItemCategories);
menuRouter.patch("/like-menu", jwt_1.decode, menu_controller_1.default.likeMenu);
menuRouter.get("/get-user-favourites", jwt_1.decode, inCart_middleware_1.default, (async (req, res, next) => {
    const result = await orders_service_1.OrderService.getMostOrdered(req);
    res.status(result?.code || 500).json(result);
}));
menuRouter.get("/get-most-popular-menu", jwt_1.decode, inCart_middleware_1.default, (async (req, res, next) => {
    const result = await orders_service_1.OrderService.getMostOrdered(req);
    res.status(result?.code || 500).json(result);
}));
menuRouter.get('/search-menu', jwt_1.decodeExt, inCart_middleware_1.default, async (req, res) => {
    try {
        const result = await search_service_1.SearchMenuservice.searchMenuAndExtrasAndCategories(req);
        res.status(result?.code || 200).json(result);
    }
    catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});
exports.default = menuRouter;
