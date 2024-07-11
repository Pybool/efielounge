"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cart_service_1 = require("../../services/v1/orders/cart.service");
const transactionController = {
    saveTransaction: async (req, res, next) => {
        try {
            let status = 400;
            const result = await cart_service_1.CartService.saveTransaction(req);
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
exports.default = transactionController;
