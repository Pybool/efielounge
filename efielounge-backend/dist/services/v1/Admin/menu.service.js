"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Menuservice = void 0;
const menu_model_1 = __importDefault(require("../../../models/menu/menu.model"));
const menu_validator_1 = __importDefault(require("../../../validators/admin/menu.validator"));
const menucategories_model_1 = __importDefault(require("../../../models/menu/menucategories.model"));
const menuitem_model_1 = __importDefault(require("../../../models/menu/menuitem.model"));
const menuitemcategories_model_1 = __importDefault(require("../../../models/menu/menuitemcategories.model"));
const slugify = ((menuName) => {
    return menuName.toString() // Convert to string
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading and trailing whitespace
        .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word characters, and hyphens with a single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
});
async function slugifyAllRecords() {
    const menus = await menu_model_1.default.find({});
    menus.forEach(async (menu) => {
        menu.slug = slugify(menu.name);
        await menu.save();
    });
}
class Menuservice {
    static async createMenu(req) {
        try {
            const requestBody = req.body;
            const requestBodyData = JSON.parse(requestBody.data);
            const validatedResult = await menu_validator_1.default.menuSchema.validateAsync(requestBodyData);
            const existingCategory = await menucategories_model_1.default.findOne({
                _id: validatedResult.category,
            });
            if (!existingCategory) {
                return {
                    status: false,
                    message: `No category with Id "${validatedResult.category}" was found`,
                    code: 404,
                };
            }
            const existingMenu = await menu_model_1.default.findOne({
                slug: slugify(validatedResult.name),
            });
            if (existingMenu) {
                return {
                    status: false,
                    message: `A menu with name "${validatedResult.name}" already exists`,
                    code: 409,
                };
            }
            let menuAttachments = req.attachments;
            console.log("menuAttachments ", menuAttachments);
            if (menuAttachments.length == 0 ||
                req.files.length != menuAttachments.length) {
                return {
                    status: false,
                    message: "Menu creation failed, no valid images were sent",
                    data: null,
                    code: 400,
                };
            }
            validatedResult.attachments = menuAttachments;
            validatedResult.slug = slugify(validatedResult.name);
            const menu = await menu_model_1.default.create(validatedResult);
            if (menu) {
                return {
                    status: true,
                    message: " Menu has been created succesfully.",
                    data: menu,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu creation failed.",
                data: null,
                code: 422,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async createMenuCategory(req) {
        try {
            const validatedResult = await menu_validator_1.default.menuCategoriesSchema.validateAsync(req.body);
            console.log(validatedResult);
            const existingCategory = await menucategories_model_1.default.findOne({
                name: validatedResult.name,
            });
            if (existingCategory) {
                return {
                    status: false,
                    message: `Category with name "${validatedResult.name}" already exists`,
                    code: 409,
                };
            }
            const menuCategory = await menucategories_model_1.default.create(validatedResult);
            if (menuCategory) {
                return {
                    status: true,
                    message: " Menu category has been created succesfully.",
                    data: menuCategory,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu Category creation failed.",
                data: null,
                code: 422,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async createMenuItem(req) {
        try {
            const requestBody = req.body;
            console.log(requestBody.data);
            const requestBodyData = JSON.parse(requestBody.data);
            const validatedResult = await menu_validator_1.default.menuItemSchema.validateAsync(requestBodyData);
            console.log(validatedResult);
            const existingMenuItem = await menuitem_model_1.default.findOne({
                name: validatedResult.name,
            });
            if (existingMenuItem) {
                return {
                    status: false,
                    message: `Menu Item with name "${validatedResult.name}" already exists`,
                    code: 409,
                };
            }
            const existingMenuItemCategory = await menuitemcategories_model_1.default.findOne({
                _id: validatedResult.category,
            });
            if (!existingMenuItemCategory) {
                return {
                    status: false,
                    message: `Menu Item category "${validatedResult.category}" does not exist`,
                    code: 404,
                };
            }
            let menuAttachments = req.attachments;
            console.log("menuAttachments ", menuAttachments);
            if (menuAttachments.length == 0 ||
                req.files.length != menuAttachments.length) {
                return {
                    status: false,
                    message: "Menu creation failed, no valid images were sent",
                    data: null,
                    code: 422,
                };
            }
            validatedResult.attachments = menuAttachments;
            const menuItem = await menuitem_model_1.default.create(validatedResult);
            if (menuItem) {
                return {
                    status: true,
                    message: " Menu item has been created succesfully.",
                    data: menuItem,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu item creation failed.",
                data: null,
                code: 422,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async createMenuItemCategory(req) {
        try {
            const validatedResult = await menu_validator_1.default.menuItemCategoriesSchema.validateAsync(req.body);
            console.log(validatedResult);
            const existingCategory = await menuitemcategories_model_1.default.findOne({
                name: validatedResult.name,
            });
            if (existingCategory) {
                return {
                    status: false,
                    message: `Menu Item Category with name "${validatedResult.name}" already exists`,
                    code: 409,
                };
            }
            const menuItemCategory = await menuitemcategories_model_1.default.create(validatedResult);
            if (menuItemCategory) {
                return {
                    status: true,
                    message: " Menu Item category has been created succesfully.",
                    data: menuItemCategory,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu Item Category creation failed.",
                data: null,
                code: 422,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.Menuservice = Menuservice;
