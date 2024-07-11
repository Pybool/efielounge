"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchMenuservice = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const menu_model_1 = __importDefault(require("../../../models/menu/menu.model"));
const menucategories_model_1 = __importDefault(require("../../../models/menu/menucategories.model"));
const menuitem_model_1 = __importDefault(require("../../../models/menu/menuitem.model"));
const ratings_model_1 = __importDefault(require("../../../models/menu/ratings.model"));
const likes_model_1 = __importDefault(require("../../../models/menu/likes.model"));
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function calculateStartIndex(page, limit) {
    return (page - 1) * limit;
}
class SearchMenuservice {
    static buildMenuFilter(searchString) {
        try {
            const searchTerms = searchString
                .split(" ")
                .filter((term) => term.trim() !== "");
            const regex = searchTerms.map((term) => new RegExp(term, "i"));
            return {
                $or: [
                    { name: { $in: regex } },
                    { description: { $in: regex } },
                    { slug: { $in: regex } },
                ],
            };
        }
        catch {
            return {};
        }
    }
    static async getMatchingMenuItemsIds(searchString) {
        try {
            const words = searchString
                .split(" ")
                .map((word) => `(?=.*${word})`)
                .join("");
            const regex = new RegExp(words, "i"); // 'i' for case-insensitive
            const menuItemsIds = await menuitem_model_1.default.find({
                name: { $regex: regex },
            }).select("_id");
            return menuItemsIds;
        }
        catch (error) {
            return [];
        }
    }
    static async getMatchingMenucategoryIds(searchString) {
        try {
            const words = searchString
                .split(" ")
                .map((word) => `(?=.*${word})`)
                .join("");
            const regex = new RegExp(words, "i"); // 'i' for case-insensitive
            const menuCategoriesIds = await menucategories_model_1.default.find({
                name: { $regex: regex },
            }).select("_id");
            return menuCategoriesIds;
        }
        catch (error) {
            return [];
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
    static async searchMenus(req) {
        try {
            await delay(2000);
            let filter = {};
            const searchString = req.query.searchString;
            filter = SearchMenuservice.buildMenuFilter(searchString);
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 20);
            const skip = (page - 1) * limit; // Calculate the number of documents to skip
            const options = {
                skip: skip, // Skip the appropriate number of documents for pagination
                limit: limit, // Limit the number of documents returned
                sort: {}, // Sort by createdAt in descending order
            };
            console.log("Search ", await menu_model_1.default.find(filter));
            const [menus, total] = await Promise.all([
                menu_model_1.default.find(filter, null, options)
                    .sort({})
                    .populate("category")
                    .populate("menuItems"),
                menu_model_1.default.countDocuments(filter),
            ]);
            console.log("Menus length ", menus.length, total);
            for (const menu of menus) {
                menu.ratings = await SearchMenuservice.computeRating(menu._id.toString());
                menu.likes = await likes_model_1.default.countDocuments({ menuId: menu._id });
            }
            return menus;
        }
        catch (error) {
            throw error;
        }
    }
    static async searchByMenuCategories(req) {
        try {
            const aggregatedResults = [];
            const searchString = req.query.searchString;
            const menuCategoriesIds = await SearchMenuservice.getMatchingMenucategoryIds(searchString);
            for (let menuCategoriesId of menuCategoriesIds) {
                const results = await menu_model_1.default.find({
                    category: new mongoose_1.default.Types.ObjectId(menuCategoriesId._id),
                })
                    .populate("category")
                    .populate("menuItems");
                aggregatedResults.push(...results);
            }
            for (const menu of [...aggregatedResults]) {
                menu.ratings = await SearchMenuservice.computeRating(menu?._id?.toString());
                menu.likes = await likes_model_1.default.countDocuments({ menuId: menu?._id });
            }
            return [...aggregatedResults];
        }
        catch (error) {
            throw error;
        }
    }
    static async searchByMenuItems(req) {
        try {
            const aggregatedResults = [];
            const searchString = req.query.searchString;
            const menuItemIds = await SearchMenuservice.getMatchingMenuItemsIds(searchString);
            for (let menuItemId of menuItemIds) {
                const results = await menu_model_1.default.find({
                    menuItems: new mongoose_1.default.Types.ObjectId(menuItemId._id),
                })
                    .populate("category")
                    .populate("menuItems");
                aggregatedResults.push(...results);
            }
            for (const menu of [...aggregatedResults]) {
                menu.ratings = await SearchMenuservice.computeRating(menu?._id?.toString());
                menu.likes = await likes_model_1.default.countDocuments({ menuId: menu?._id });
            }
            return [...aggregatedResults];
        }
        catch (error) {
            throw error;
        }
    }
    static async searchMenuAndExtrasAndCategories(req) {
        try {
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 20);
            const searchMenusResults = await SearchMenuservice.searchMenus(req);
            const searchByMenuItemsResults = await SearchMenuservice.searchByMenuItems(req);
            const searchByMenucategoriesResults = await SearchMenuservice.searchByMenuCategories(req);
            const aggregatedResults = [
                ...searchMenusResults,
                ...searchByMenuItemsResults,
                ...searchByMenucategoriesResults,
            ];
            const total = aggregatedResults.length;
            const totalPages = Math.ceil(total / limit);
            const offset = calculateStartIndex(page, limit);
            // Ensure the offset does not exceed the total number of items
            let startOffset = Math.min(offset, total);
            if (startOffset < 0) {
                startOffset = 0;
            }
            // The end index for slice should be startOffset + limit, but it should not exceed the total number of items
            const endOffset = Math.min(startOffset + limit, total);
            if (startOffset + limit > total) {
                if (startOffset > 0) {
                    startOffset -= 1;
                }
            }
            let searchResults = aggregatedResults.slice(startOffset, endOffset);
            if (page > totalPages) {
                searchResults = [];
            }
            const removeDuplicates = (array) => {
                const seen = new Set();
                return array.filter((item) => {
                    const duplicate = seen.has(item._id.toString());
                    seen.add(item._id.toString());
                    return !duplicate;
                });
            };
            return {
                status: true,
                data: removeDuplicates(searchResults),
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
}
exports.SearchMenuservice = SearchMenuservice;
