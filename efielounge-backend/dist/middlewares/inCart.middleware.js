"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInCart = void 0;
const cart_model_1 = __importDefault(require("../models/Orders/cart.model"));
const likes_model_1 = __importDefault(require("../models/menu/likes.model"));
const ratings_model_1 = __importDefault(require("../models/menu/ratings.model"));
async function checkIfMenuInCart(accountId, menuId) {
    const exists = await cart_model_1.default.findOne({ account: accountId, menu: menuId });
    if (exists?.menu.toString() === menuId) {
        return true;
    }
    return false;
}
async function checkIfILiked(account, menuId) {
    const exists = await likes_model_1.default.findOne({ account, menuId: menuId });
    if (exists?.menuId.toString() === menuId) {
        return true;
    }
    return false;
}
async function checkIfIRated(account, menuId) {
    const exists = await ratings_model_1.default.findOne({ account, menu: menuId });
    if (exists?.menu.toString() === menuId) {
        return true;
    }
    return false;
}
// Middleware function to cache responses
function updateInCart(req, res, next) {
    // Create a new property on the res object to cache the response
    res.modifyMenuResponse = async (data) => {
        try {
            let response = JSON.parse(data);
            let menudata = response.data;
            for (let menu of menudata) {
                menu.inCart = await checkIfMenuInCart(req.accountId, menu._id);
                menu.iLiked = await checkIfILiked(req.accountId, menu._id);
                menu.iRated = await checkIfIRated(req.accountId, menu._id);
            }
            response.data = menudata;
            return JSON.stringify(response);
        }
        catch (error) {
            console.error("Error caching response:", error);
        }
    };
    // Intercept the send method of the response to cache the response before sending
    const originalSend = res.send;
    res.send = async function (body) {
        const newBody = await res.modifyMenuResponse(body, 3600); // Set TTL as desired
        // Call the original send method to send the response
        originalSend.call(this, newBody);
    };
    next();
}
exports.updateInCart = updateInCart;
exports.default = updateInCart;
