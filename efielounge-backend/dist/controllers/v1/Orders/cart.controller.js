"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cart_service_1 = require("../../../services/v1/orders/cart.service");
const clientCartController = {
    addToCart: async (req, res, next) => {
        try {
            let status = 400;
            const result = await cart_service_1.CartService.addToCart(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    getCart: async (req, res, next) => {
        try {
            let status = 400;
            const result = await cart_service_1.CartService.getCart(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    removeFromCart: async (req, res, next) => {
        try {
            let status = 400;
            const result = await cart_service_1.CartService.removeFromCart(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    updateCart: async (req, res, next) => {
        try {
            let status = 400;
            const result = await cart_service_1.CartService.updateCart(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    checkOut: async (req, res, next) => {
        try {
            let status = 400;
            const result = await cart_service_1.CartService.checkOut(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    uploadReceipt: async (req, res, next) => {
        try {
            let status = 400;
            const result = await cart_service_1.CartService.uploadReceipt(req);
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
exports.default = clientCartController;
