"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cart_model_1 = __importDefault(require("../../../models/Orders/cart.model"));
const order_model_1 = __importDefault(require("../../../models/Orders/order.model"));
const menu_model_1 = __importDefault(require("../../../models/menu/menu.model"));
const checkoutIntent_model_1 = __importDefault(require("../../../models/Checkout/checkoutIntent.model"));
const mail_service_1 = __importDefault(require("../Mail/mail.service"));
const accounts_model_1 = __importDefault(require("../../../models/Accounts/accounts.model"));
const ratings_model_1 = __importDefault(require("../../../models/menu/ratings.model"));
const menu_service_1 = require("../menu/menu.service");
const likes_model_1 = __importDefault(require("../../../models/menu/likes.model"));
async function checkIfIRated(account, menuId) {
    const exists = await ratings_model_1.default.findOne({ account, menu: menuId });
    if (exists?.menu.toString() === menuId.toString()) {
        return true;
    }
    return false;
}
class OrderService {
    static async createOrder(checkOutIntent) {
        try {
            console.log(checkOutIntent);
            const cartIds = checkOutIntent.cart.map((itemId) => new mongoose_1.default.Types.ObjectId(itemId));
            const cartItems = await cart_model_1.default.find({ _id: { $in: cartIds } })
                .select("-_id -__v")
                .lean();
            const savedOrders = [];
            for (const cartitem of cartItems) {
                cartitem.createdAt = new Date();
                cartitem.checkOutId = checkOutIntent.checkOutId;
                try {
                    const order = await order_model_1.default.create(cartitem);
                    console.log("Created", order);
                    savedOrders.push(order._id);
                }
                catch (error) {
                    console.error("Error creating order:", error);
                    // Rollback logic:
                    // 1. Identify orders to rollback (created before the error):
                    const ordersToRollback = savedOrders.slice(); // Copy saved orders array
                    // 2. Loop backwards to avoid order deletion issues:
                    for (let i = ordersToRollback.length - 1; i >= 0; i--) {
                        const orderId = ordersToRollback[i];
                        await order_model_1.default.deleteOne({ _id: orderId });
                        console.warn(`Order ${orderId} rolled back due to error.`);
                    }
                    // 3. Re-throw the error to stop further processing:
                    throw error;
                }
            }
            const deletedCount = await cart_model_1.default.deleteMany({ _id: { $in: cartIds } });
            console.log(`Deleted ${deletedCount} cart items.`);
            console.log("All orders created successfully!");
            const account = await accounts_model_1.default.findOne({ _id: checkOutIntent.account });
            if (account) {
                mail_service_1.default.orders.sendOrderSuccessfulMail(account.email, checkOutIntent.checkOutId);
            }
        }
        catch (error) {
            console.error("Overall error:", error);
        }
    }
    static async getMostOrdered(req) {
        const accountId = req.accountId;
        try {
            // Fetch all orders for the user
            let userOrders;
            let allOrders;
            let populatedUserTopOrderedMenu = [];
            let populatedOverallTopOrderedMenu = [];
            if (accountId) {
                userOrders = await order_model_1.default.find({ account: accountId })
                    .populate("menu")
                    .exec();
            }
            else {
                // Fetch all orders for overall statistics
                allOrders = await order_model_1.default.find().populate("menu").exec();
            }
            // Function to get top 3 most ordered menu items from a list of orders
            const getTopMostOrderedMenu = (orders, limit = 3) => {
                const menuCount = {};
                orders.forEach((order) => {
                    const menuId = order.menu._id.toString();
                    if (!menuCount[menuId]) {
                        menuCount[menuId] = { count: 0, menu: order.menu };
                    }
                    menuCount[menuId].count++;
                });
                const sortedMenuItems = Object.values(menuCount).sort((a, b) => b.count - a.count);
                const topMenuItems = sortedMenuItems.slice(0, limit);
                return topMenuItems.map((item) => item.menu);
            };
            // Populate the menuItems field for the top menu items
            if (accountId) {
                const userTopOrderedMenu = getTopMostOrderedMenu(userOrders);
                populatedUserTopOrderedMenu = await menu_model_1.default.populate(userTopOrderedMenu, [
                    { path: "menuItems" },
                    { path: "category" },
                ]);
            }
            else {
                const overallTopOrderedMenu = getTopMostOrderedMenu(allOrders, 4);
                populatedOverallTopOrderedMenu = await menu_model_1.default.populate(overallTopOrderedMenu, [{ path: "menuItems" }, { path: "category" }]);
            }
            const rateAndLike = (async (arr) => {
                for (const menu of arr) {
                    menu.ratings = await menu_service_1.Menuservice.computeRating(menu._id.toString());
                    menu.likes = await likes_model_1.default.countDocuments({ menuId: menu._id });
                }
            });
            if (accountId) {
                await rateAndLike(populatedUserTopOrderedMenu);
                return {
                    status: true,
                    data: populatedUserTopOrderedMenu,
                    code: 200,
                };
            }
            await rateAndLike(populatedOverallTopOrderedMenu);
            return {
                status: true,
                data: populatedOverallTopOrderedMenu,
                code: 200,
            };
        }
        catch (error) {
            console.error("Error getting most ordered items:", error);
            throw error; // Or handle the error differently
        }
    }
    static async collapseOrders(orders) {
        const groupedOrders = orders.reduce((acc, order) => {
            const checkOutId = order.checkOutId;
            acc[checkOutId] = acc[checkOutId] || []; // Initialize array if not existing
            acc[checkOutId].push(order);
            return acc;
        }, {});
        const collapsedOrders = await Promise.all(Object.entries(groupedOrders).map(async ([checkOutId, orders]) => {
            const checkOut = await checkoutIntent_model_1.default.findOne({ checkOutId: checkOutId });
            const date = groupedOrders[checkOutId][0]?.createdAt;
            return {
                checkOutId,
                orders,
                date,
                grandTotal: checkOut ? checkOut.amount : 0, // or another default value if not found
            };
        }));
        return collapsedOrders;
    }
    static async computeRating(menu) {
        try {
            const ratings = await ratings_model_1.default.find({ menu });
            if (ratings.length === 0) {
                return 0;
            }
            const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);
            const averageRating = totalRating / ratings.length;
            return averageRating;
        }
        catch (error) {
            return 0;
        }
    }
    static async rateMenu(req) {
        try {
            const data = req.body;
            const canRate = await order_model_1.default.findOne({
                account: req.accountId,
                menu: data.menu,
            }).populate("menu");
            if (!canRate) {
                return {
                    status: false,
                    message: "You cannot rate a product you have no bought",
                    code: 400,
                };
            }
            data.account = req.accountId;
            const rating = await ratings_model_1.default.create(data);
            rating.rating = await menu_service_1.Menuservice.computeRating(canRate?.menu._id.toString());
            return {
                status: true,
                message: `Thank you for rating ${canRate?.menu?.name}`,
                data: await rating.populate("menu"),
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async fetchOrders(req) {
        try {
            let filter = {};
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 100);
            filter = OrderService.buildFilter(req);
            console.log("Filter ", filter);
            const skip = (page - 1) * limit; // Calculate the number of documents to skip
            const options = {
                skip: skip, // Skip the appropriate number of documents for pagination
                limit: limit, // Limit the number of documents returned
                sort: {}, // Sort by createdAt in descending order
            };
            const [orders, total] = await Promise.all([
                order_model_1.default.find(filter, null, options)
                    .sort({ createdAt: -1 })
                    .populate({
                    path: "menu",
                    populate: {
                        path: "menuItems",
                    },
                })
                    .populate("customMenuItems"),
                order_model_1.default.countDocuments(filter),
            ]);
            const totalPages = Math.ceil(total / limit);
            for (const order of orders) {
                order.menu.ratings = await OrderService.computeRating(order.menu._id.toString());
                order.menu.likes = await order_model_1.default.countDocuments({ menu: order.menu._id });
                order.menu.iRated = await checkIfIRated(req.accountId, order.menu._id);
            }
            return {
                status: true,
                data: await OrderService.collapseOrders(orders),
                total: total,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                message: "Orders were fetched successfully",
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static buildFilter(req) {
        try {
            if (req.query.filter != 'all') {
                return { status: req.query.filter };
            }
            else if (req.query.filter == "all") {
                return {};
            }
            return { account: req.accountId };
        }
        catch {
            return { account: req.accountId };
        }
    }
}
exports.OrderService = OrderService;
