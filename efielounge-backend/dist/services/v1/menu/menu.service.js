"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Menuservice = void 0;
const mongoose_1 = require("mongoose");
const menu_model_1 = __importDefault(require("../../../models/menu/menu.model"));
const menucategories_model_1 = __importDefault(require("../../../models/menu/menucategories.model"));
const menuitem_model_1 = __importDefault(require("../../../models/menu/menuitem.model"));
const menuitemcategories_model_1 = __importDefault(require("../../../models/menu/menuitemcategories.model"));
const ratings_model_1 = __importDefault(require("../../../models/menu/ratings.model"));
const likes_model_1 = __importDefault(require("../../../models/menu/likes.model"));
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
class Menuservice {
    static buildFilter(req) {
        try {
            if (req.query.filter) {
                if (req.query.field == "status") {
                    return { status: req.query.filter, archive: false };
                }
                else if (req.query.field == "category") {
                    return { category: new mongoose_1.Types.ObjectId(req.query.filter), archive: false };
                }
            }
            return { archive: false };
        }
        catch {
            return { archive: false };
        }
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
    static async getMenus(req) {
        try {
            await delay(1000);
            let filter = {};
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 20);
            filter = Menuservice.buildFilter(req);
            const skip = (page - 1) * limit; // Calculate the number of documents to skip
            const options = {
                skip: skip, // Skip the appropriate number of documents for pagination
                limit: limit, // Limit the number of documents returned
                sort: {}, // Sort by createdAt in descending order
            };
            const [menus, total] = await Promise.all([
                menu_model_1.default.find(filter, null, options)
                    .sort({})
                    .populate("category")
                    .populate("menuItems"),
                menu_model_1.default.countDocuments(filter),
            ]);
            const totalPages = Math.ceil(total / limit);
            for (const menu of menus) {
                menu.ratings = await Menuservice.computeRating(menu._id.toString());
                menu.likes = await likes_model_1.default.countDocuments({ menuId: menu._id });
            }
            return {
                status: true,
                data: menus,
                total: total,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                message: "Menu was fetched successfully",
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async getMenuCategories() {
        try {
            const categories = await menucategories_model_1.default.find({ archive: false });
            return {
                status: true,
                message: "Categories fetched successfully",
                data: categories,
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async getMenuItemCategories() {
        try {
            const categories = await menuitemcategories_model_1.default.find({ archive: false });
            return {
                status: true,
                message: "Menu Item Categories fetched successfully",
                data: categories,
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async getMenuItems() {
        try {
            const menuItems = await menuitem_model_1.default.find({ archive: false }).populate("category");
            return {
                status: true,
                message: "Menu Item fetched successfully",
                data: menuItems,
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async fetchMenuDetail(req) {
        const slug = req.query.slug;
        const menu = await menu_model_1.default.findOne({
            slug: slug,
        });
        if (!menu) {
            return {
                status: false,
                message: `No menu with slug "${slug}" was found`,
                code: 404,
            };
        }
        return {
            status: true,
            message: `Menu detail for ${slug} was fetched successfully`,
            data: menu,
            code: 200,
        };
    }
    static async likeMenu(req) {
        try {
            let like;
            const { _id } = req.body;
            const account = req.accountId;
            const likeExists = await likes_model_1.default.findOne({ account, menuId: _id });
            console.log("Like exists ", likeExists);
            if (!likeExists) {
                like = await likes_model_1.default.create({ account, menuId: _id });
            }
            else {
                like = await likes_model_1.default.findOneAndDelete({ account, menuId: _id });
            }
            return {
                status: true,
                message: ``,
                data: like,
                code: 200,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.Menuservice = Menuservice;
