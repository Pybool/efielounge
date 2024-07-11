"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const accounts_model_1 = __importDefault(require("../../../models/Accounts/accounts.model"));
const checkoutIntent_model_1 = __importDefault(require("../../../models/Checkout/checkoutIntent.model"));
const orderSequence_model_1 = __importDefault(require("../../../models/Checkout/orderSequence.model"));
const menu_model_1 = __importDefault(require("../../../models/menu/menu.model"));
const cart_model_1 = __importDefault(require("../../../models/Orders/cart.model"));
const paymentProofs_model_1 = __importDefault(require("../../../models/transactions/paymentProofs.model"));
const orders_service_1 = require("./orders.service");
const transactions_model_1 = __importDefault(require("../../../models/transactions/transactions.model"));
const crypto = require("crypto"); // Assuming you're using Node.js
class CartService {
    static async addToCart(req) {
        try {
            const cartPayload = req.body;
            const menu = await menu_model_1.default.findOne({ _id: cartPayload.menu });
            const account = await accounts_model_1.default.findOne({
                _id: req.accountId,
            });
            console.log("account ", account);
            if (!account) {
                return {
                    status: false,
                    message: "No such user account was found",
                    code: 404,
                };
            }
            if (!menu) {
                return {
                    status: false,
                    message: "No such menu was found",
                    code: 404,
                };
            }
            if (!Number.isInteger(cartPayload?.units)) {
                return {
                    status: false,
                    message: "Units must be a valid integer",
                    code: 400,
                };
            }
            if (cartPayload?.units > 10) {
                return {
                    status: false,
                    message: "You cannot order more than 10 units",
                    code: 400,
                };
            }
            const exists = await cart_model_1.default.findOne({ account: req.accountId, menu: cartPayload.menu });
            if (!exists) {
                cartPayload.account = account._id;
                cartPayload.createdAt = new Date();
                const cartItem = await cart_model_1.default.create(cartPayload);
                return {
                    status: true,
                    message: "Menu added to cart succesfully",
                    isMerged: false,
                    data: cartItem,
                    code: 200,
                };
            }
            exists.updatedAt = new Date();
            exists.units = exists.units + cartPayload.units;
            const mergedMenu = await exists.save();
            return {
                status: true,
                message: "Merged menu units in your cart",
                isMerged: true,
                data: mergedMenu,
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async getCart(req) {
        try {
            let cart;
            const checkOutId = req.query.checkOutId;
            if (checkOutId.startsWith("EF")) {
                const checkOutIntent = await checkoutIntent_model_1.default.findOne({
                    checkOutId: checkOutId,
                });
                if (checkOutIntent) {
                    cart = await cart_model_1.default.find({
                        account: req.accountId,
                        _id: { $in: checkOutIntent.cart }, // Optimized filter
                    })
                        .sort({ createdAt: -1 }) // Sort by creation date (most recent first)
                        .populate("account") // Populate account data
                        .populate("menu")
                        .populate({ path: "menu", populate: { path: "menuItems" } })
                        .populate("customMenuItems");
                }
                else {
                    return {
                        status: false,
                        message: `No checkout intent was found for checkoutId ${checkOutId}`,
                        code: 404,
                    };
                }
            }
            else {
                cart = await cart_model_1.default.find({
                    account: req.accountId,
                })
                    .sort({ createdAt: -1 })
                    .populate("account")
                    .populate("menu")
                    .populate({ path: "menu", populate: { path: "menuItems" } })
                    .populate("customMenuItems");
            }
            return {
                status: true,
                message: "Cart successfully fetched",
                data: cart,
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async removeFromCart(req) {
        try {
            const { cartItemId } = req.body;
            const account = await accounts_model_1.default.findOne({
                _id: req.accountId,
            });
            if (!account) {
                return {
                    status: false,
                    message: "No such user account was found",
                    code: 404,
                };
            }
            const cartItem = await cart_model_1.default.findOne({
                account: req.accountId,
                _id: cartItemId,
            });
            if (!cartItem) {
                return {
                    status: false,
                    message: "Cart Item was not found in cart",
                    code: 404,
                };
            }
            await cart_model_1.default.findOneAndDelete({
                account: req.accountId,
                _id: cartItemId,
            });
            //If a cart item is removed delete its checkoutIntent
            // await CheckOut.findOneAndDelete({ account: req.accountId });
            return {
                status: true,
                message: "Cart item successfully removed",
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async updateCart(req) {
        try {
            const cartItemId = req.body?.cartItemId;
            const units = req.body?.units;
            const customMenuItems = req.body?.customMenuItems;
            const cartItem = await cart_model_1.default.findOne({
                account: req.accountId,
                _id: cartItemId,
            });
            if (!cartItem) {
                return {
                    status: false,
                    message: "Cart Item was not found in cart",
                    code: 404,
                };
            }
            if (units && !Number.isInteger(units)) {
                return {
                    status: false,
                    message: "Units must be a valid integer",
                    code: 400,
                };
            }
            else {
                cartItem.units = units;
            }
            if (customMenuItems) {
                cartItem.customMenuItems = customMenuItems;
            }
            else {
                cartItem.customMenuItems = null;
            }
            const updatedCart = await cartItem.save();
            return {
                status: true,
                message: "Cart was upated",
                data: updatedCart,
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async checkOut(req) {
        try {
            const { cartItems, amount } = req.body;
            const checkOutId = req.query.checkOutId;
            const cartItemIds = [];
            for (let cartItem of cartItems) {
                cartItemIds.push(cartItem._id);
                const cartItemDb = await cart_model_1.default.findOne({ _id: cartItem._id });
                if (cartItemDb) {
                    cartItemDb.units = cartItem.units;
                    await cartItemDb.save();
                }
                else {
                    return {
                        status: false,
                        message: "A cartItem was not found in records",
                        code: 404,
                    };
                }
            }
            let checkOutIntent = await checkoutIntent_model_1.default.findOne({
                account: req.accountId,
                checkOutId: checkOutId,
            });
            if (!checkOutIntent) {
                // await CheckOut.findOneAndDelete({ account: req.accountId });
                const newCheckOutId = await CartService.generateCheckOutId();
                checkOutIntent = await checkoutIntent_model_1.default.create({
                    checkOutId: newCheckOutId,
                    cart: cartItemIds,
                    account: req.accountId,
                    amount: amount
                });
            }
            else {
                checkOutIntent = await checkoutIntent_model_1.default.findOneAndUpdate({ checkOutId: checkOutId }, {
                    cart: cartItemIds,
                    account: req.accountId,
                    amount: amount
                }, { new: true });
                if (checkOutIntent?.cart.length == 0) {
                    await checkoutIntent_model_1.default.findOneAndDelete({ account: req.accountId });
                }
            }
            return {
                status: true,
                message: "Checking out was successful",
                data: checkOutIntent,
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async generateCheckOutId() {
        try {
            const sequenceDoc = await orderSequence_model_1.default.findOneAndUpdate({}, // Empty filter to update the single sequence document
            { $inc: { sequence: 1 } }, // Increment the sequence counter
            { new: true, upsert: true } // Return the updated document, create if not found
            );
            const sequence = String(sequenceDoc.sequence).padStart(6, "0"); // Format with leading zeros
            const checksum = sequence % 10; // Simple modulo 10 checksum
            const orderId = `EF-${sequence}${checksum}`; // Prepend prefix and checksum
            return orderId;
        }
        catch (error) {
            console.error("Error generating order ID:", error);
            throw error; // Re-throw the error for further handling
        }
    }
    static async uploadReceipt(req) {
        try {
            const attachments = req.attachments;
            const requestBody = req.body;
            const ref = requestBody.ref;
            console.log("REF ", ref, req.accountId, req.attachments, attachments);
            let checkOutIntent = await checkoutIntent_model_1.default.findOne({
                account: req.accountId,
                checkOutId: ref,
            });
            if (!checkOutIntent) {
                return {
                    status: false,
                    message: "No such payment reference exists on your account",
                    code: 404,
                };
            }
            if (attachments?.length == 0) {
                return {
                    status: false,
                    message: "No valid images were sent",
                    data: null,
                    code: 400,
                };
            }
            const proof = await paymentProofs_model_1.default.create({ checkOutId: ref, attachments });
            const checkOutIntentMod = {
                account: checkOutIntent.account,
                checkOutId: checkOutIntent.checkOutId,
                cart: checkOutIntent.cart,
                status: checkOutIntent.status
            };
            await orders_service_1.OrderService.createOrder(checkOutIntentMod);
            return {
                status: true,
                data: proof,
                message: "Receipt uploaded successfully",
                code: 201,
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    static async saveTransaction(req) {
        try {
            const payload = req.body;
            payload.createdAt = new Date();
            let checkOutIntent = await checkoutIntent_model_1.default.findOne({
                account: req.accountId,
                checkOutId: payload.checkOutId,
            });
            if (!checkOutIntent) {
                return {
                    status: false,
                    message: "No such payment reference exists on your account",
                    code: 404,
                };
            }
            const checkOutIntentMod = {
                account: checkOutIntent.account,
                checkOutId: checkOutIntent.checkOutId,
                cart: checkOutIntent.cart,
                status: checkOutIntent.status
            };
            await orders_service_1.OrderService.createOrder(checkOutIntentMod);
            const transaction = await transactions_model_1.default.create(payload);
            return {
                status: true,
                message: "Transaction created & saved",
                data: transaction,
                code: 201
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CartService = CartService;
