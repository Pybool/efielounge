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
                    return { status: req.query.filter };
                }
                else if (req.query.field == "category") {
                    return { category: new mongoose_1.Types.ObjectId(req.query.filter) };
                }
            }
            return {};
        }
        catch {
            return {};
        }
    }
    static async computeRating(menuId) {
        try {
            const ratings = await ratings_model_1.default.find({ menuId });
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
            let filter = {};
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 20);
            filter = Menuservice.buildFilter(req);
            const options = {
                page: page,
                limit: limit,
                sort: {},
            };
            const [menus, total] = await Promise.all([
                menu_model_1.default.find(filter, null, options).sort({ createdAt: -1 }).populate("category").populate("menuItems"),
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
            const categories = await menucategories_model_1.default.find({});
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
            const categories = await menuitemcategories_model_1.default.find({});
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
            const menuItems = await menuitem_model_1.default.find({}).populate("category");
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
            code: 200
        };
    }
}
exports.Menuservice = Menuservice;
