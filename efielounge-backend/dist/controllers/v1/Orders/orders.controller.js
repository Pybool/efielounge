"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_service_1 = require("../../../services/v1/orders/orders.service");
const clientOrderController = {
    fetchOrders: async (req, res, next) => {
        try {
            let status = 400;
            const result = await orders_service_1.OrderService.fetchOrders(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    rateMenu: async (req, res, next) => {
        try {
            let status = 400;
            const result = await orders_service_1.OrderService.rateMenu(req);
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
exports.default = clientOrderController;
