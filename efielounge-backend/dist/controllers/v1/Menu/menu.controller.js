"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const menu_service_1 = require("../../../services/v1/menu/menu.service");
const clientMenuController = {
    getMenus: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.getMenus(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    getMenuCategories: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.getMenuCategories();
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    fetchMenuDetail: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.fetchMenuDetail(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
};
exports.default = clientMenuController;
