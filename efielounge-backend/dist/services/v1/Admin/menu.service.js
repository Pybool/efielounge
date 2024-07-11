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
const slugify = (menuName) => {
    return menuName
        .toString() // Convert to string
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading and trailing whitespace
        .replace(/[\s\W-]+/g, "-") // Replace spaces, non-word characters, and hyphens with a single hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
};
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
                    code: 400,
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
            validatedResult.createdAt = new Date();
            const menu = await menu_model_1.default.create(validatedResult);
            if (menu) {
                const categoryPopulatedMenu = await menu.populate("category");
                return {
                    status: true,
                    message: " Menu has been created succesfully.",
                    data: await categoryPopulatedMenu.populate("menuItems"),
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
    static async editMenu(req) {
        try {
            const validatedResult = await menu_validator_1.default.menuSchema.validateAsync(req.body);
            const menu = await menu_model_1.default.findOne({
                _id: validatedResult._id,
            });
            if (!menu) {
                return {
                    status: false,
                    message: `Menu with id "${validatedResult._id}" does not exist`,
                    code: 400,
                };
            }
            if (menu) {
                const updated = await menu_model_1.default.findOneAndUpdate({ _id: validatedResult._id }, validatedResult, { new: true });
                return {
                    status: true,
                    message: " Menu has been updated succesfully.",
                    data: updated,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu update failed.",
                data: null,
                code: 422,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async archiveMenu(req) {
        try {
            const data = req.body;
            const menu = await menu_model_1.default.findOne({
                _id: data._id,
            });
            if (!menu) {
                return {
                    status: false,
                    message: `Menu with id "${data._id}" does not exist`,
                    code: 400,
                };
            }
            if (menu) {
                let archiveState = false;
                if (data.archiveState === 1) {
                    archiveState = true;
                }
                menu.archive = archiveState;
                const updated = await menu.save();
                return {
                    status: true,
                    message: " Menu has been archived succesfully.",
                    data: updated,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu archive failed.",
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
                    code: 400,
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
                    data: await menuItem.populate("category"),
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
    static async editMenuItem(req) {
        try {
            const validatedResult = await menu_validator_1.default.menuItemSchema.validateAsync(req.body);
            const menuItem = await menuitem_model_1.default.findOne({
                _id: validatedResult._id,
            });
            if (!menuItem) {
                return {
                    status: false,
                    message: `Menu Item with id "${validatedResult._id}" does not exist`,
                    code: 400,
                };
            }
            if (menuItem) {
                const updated = await menuitem_model_1.default.findOneAndUpdate({ _id: validatedResult._id }, validatedResult, { new: true });
                return {
                    status: true,
                    message: " Menu Item has been updated succesfully.",
                    data: updated,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu Item update failed.",
                data: null,
                code: 422,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async archiveMenuItem(req) {
        try {
            const data = req.body;
            const menuItem = await menuitem_model_1.default.findOne({
                _id: data._id,
            });
            if (!menuItem) {
                return {
                    status: false,
                    message: `Menu Item with id "${data._id}" does not exist`,
                    code: 400,
                };
            }
            if (menuItem) {
                let archiveState = false;
                if (data.archive === 1) {
                    archiveState = true;
                }
                menuItem.archive = archiveState;
                const updated = await menuItem.save();
                return {
                    status: true,
                    message: " Menu Item has been archived succesfully.",
                    data: updated,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu Item archive failed.",
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
            validatedResult.createdAt = new Date();
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
    static async editMenuItemCategory(req) {
        try {
            const validatedResult = await menu_validator_1.default.menuItemCategoriesSchema.validateAsync(req.body);
            const menuItemCategory = await menuitemcategories_model_1.default.findOne({
                _id: validatedResult._id,
            });
            if (!menuItemCategory) {
                return {
                    status: false,
                    message: `Menu Item Category with id "${validatedResult._id}" does not exist`,
                    code: 400,
                };
            }
            if (menuItemCategory) {
                menuItemCategory.name = validatedResult.name;
                const updated = await menuItemCategory.save();
                return {
                    status: true,
                    message: " Menu Item category has been updated succesfully.",
                    data: updated,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu Item Category update failed.",
                data: null,
                code: 422,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async archiveMenuItemCategory(req) {
        try {
            const data = req.body;
            const menuItemCategory = await menuitemcategories_model_1.default.findOne({
                _id: data._id,
            });
            if (!menuItemCategory) {
                return {
                    status: false,
                    message: `Menu Item Category with id "${data._id}" does not exist`,
                    code: 400,
                };
            }
            if (menuItemCategory) {
                let archiveState = false;
                if (data.archive === 1) {
                    archiveState = true;
                }
                menuItemCategory.archive = archiveState;
                const updated = await menuItemCategory.save();
                return {
                    status: true,
                    message: " Menu Item category has been archived succesfully.",
                    data: updated,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu Item Category archive failed.",
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
            const existingCategory = await menucategories_model_1.default.findOne({
                name: validatedResult.name,
            });
            if (existingCategory) {
                return {
                    status: false,
                    message: `Menu Category with name "${validatedResult.name}" already exists`,
                    code: 409,
                };
            }
            validatedResult.createdAt = new Date();
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
    static async editMenuCategory(req) {
        try {
            const validatedResult = await menu_validator_1.default.menuCategoriesSchema.validateAsync(req.body);
            const menuCategory = await menucategories_model_1.default.findOne({
                _id: validatedResult._id,
            });
            if (!menuCategory) {
                return {
                    status: false,
                    message: `Menu Category with id "${validatedResult._id}" does not exist`,
                    code: 400,
                };
            }
            if (menuCategory) {
                menuCategory.name = validatedResult.name;
                const updated = await menuCategory.save();
                return {
                    status: true,
                    message: " Menu category has been updated succesfully.",
                    data: updated,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu Category update failed.",
                data: null,
                code: 422,
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async archiveMenuCategory(req) {
        try {
            const data = req.body;
            const menuCategory = await menucategories_model_1.default.findOne({
                _id: data._id,
            });
            if (!menuCategory) {
                return {
                    status: false,
                    message: `Menu Category with id "${data._id}" does not exist`,
                    code: 400,
                };
            }
            if (menuCategory) {
                let archiveState = false;
                if (data.archive === 1) {
                    archiveState = true;
                }
                menuCategory.archive = archiveState;
                const updated = await menuCategory.save();
                return {
                    status: true,
                    message: " Menu category has been archived succesfully.",
                    data: updated,
                    code: 201,
                };
            }
            return {
                status: false,
                message: "Menu Category archive failed.",
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
