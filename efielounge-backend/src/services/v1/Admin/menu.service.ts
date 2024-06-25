import { Types } from "mongoose";
import Xrequest from "../../../interfaces/extensions.interface";
import {
  Imenu,
  ImenuCategory,
  ImenuItem,
  ImenuItemCategory,
} from "../../../interfaces/menu.interface";
import Menu from "../../../models/menu/menu.model";
import validations from "../../../validators/admin/menu.validator";
import MenuCategories from "../../../models/menu/menucategories.model";
import MenuItem from "../../../models/menu/menuitem.model";
import MenuItemCategories from "../../../models/menu/menuitemcategories.model";

const slugify = ((menuName:string)=>{
  return menuName.toString()                // Convert to string
  .toLowerCase()             // Convert to lowercase
  .trim()                    // Remove leading and trailing whitespace
  .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word characters, and hyphens with a single hyphen
  .replace(/^-+|-+$/g, '');  // Remove leading and trailing hyphens
})

async function slugifyAllRecords(){
  const menus = await Menu.find({})
  menus.forEach(async(menu:any)=>{
    menu.slug = slugify(menu.name)
    await menu.save()
  })
}

export class Menuservice {
  static async createMenu(req: Xrequest) {

    try {
      const requestBody = req.body;
      const requestBodyData = JSON.parse(requestBody.data);
      const validatedResult: Imenu = await validations.menuSchema.validateAsync(
        requestBodyData
      );
      const existingCategory: any = await MenuCategories.findOne({
        _id: validatedResult.category,
      });

      if (!existingCategory) {
        return {
          status: false,
          message: `No category with Id "${validatedResult.category}" was found`,
          code: 404,
        };
      }
      const existingMenu: any = await Menu.findOne({
        slug: slugify(validatedResult.name),
      });
      if (existingMenu) {
        return {
          status: false,
          message: `A menu with name "${validatedResult.name}" already exists`,
          code: 409,
        };
      }

      let menuAttachments = req.attachments!;
      console.log("menuAttachments ", menuAttachments);
      if (
        menuAttachments.length == 0 ||
        req.files.length != menuAttachments.length
      ) {
        return {
          status: false,
          message: "Menu creation failed, no valid images were sent",
          data: null,
          code: 400,
        };
      }
      validatedResult.attachments = menuAttachments;
      validatedResult.slug = slugify(validatedResult.name)
      validatedResult.createdAt = new Date()
      const menu = await Menu.create(validatedResult);
      if (menu) {
        const categoryPopulatedMenu = await menu.populate("category")
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
    } catch (error: any) {
      throw error;
    }
  }

  static async createMenuCategory(req: Xrequest) {
    try {
      const validatedResult: ImenuCategory =
        await validations.menuCategoriesSchema.validateAsync(req.body!);
      console.log(validatedResult);
      const existingCategory: any = await MenuCategories.findOne({
        name: validatedResult.name,
      });
      if (existingCategory) {
        return {
          status: false,
          message: `Category with name "${validatedResult.name}" already exists`,
          code: 409,
        };
      }
      validatedResult.createdAt = new Date()
      const menuCategory = await MenuCategories.create(validatedResult);
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
    } catch (error: any) {
      throw error;
    }
  }

  static async createMenuItem(req: Xrequest) {
    try {
      const requestBody = req.body;
      console.log(requestBody.data)
      const requestBodyData = JSON.parse(requestBody.data);
      const validatedResult: ImenuItem = await validations.menuItemSchema.validateAsync(requestBodyData);
      console.log(validatedResult);
      const existingMenuItem: any = await MenuItem.findOne({
        name: validatedResult.name,
      });
      if (existingMenuItem) {
        return {
          status: false,
          message: `Menu Item with name "${validatedResult.name}" already exists`,
          code: 409,
        };
      }
      const existingMenuItemCategory: any = await MenuItemCategories.findOne({
        _id: validatedResult.category,
      });

      if (!existingMenuItemCategory) {
        return {
          status: false,
          message: `Menu Item category "${validatedResult.category}" does not exist`,
          code: 404,
        };
      }

      let menuAttachments = req.attachments!;
      console.log("menuAttachments ", menuAttachments);
      if (
        menuAttachments.length == 0 ||
        req.files.length != menuAttachments.length
      ) {
        return {
          status: false,
          message: "Menu creation failed, no valid images were sent",
          data: null,
          code: 422,
        };
      }
      validatedResult.attachments = menuAttachments;

      const menuItem = await MenuItem.create(validatedResult);
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
    } catch (error: any) {
      throw error;
    }
  }

  static async createMenuItemCategory(req: Xrequest) {
    try {
      const validatedResult: ImenuItemCategory =
        await validations.menuItemCategoriesSchema.validateAsync(req.body!);
      console.log(validatedResult);
      const existingCategory: any = await MenuItemCategories.findOne({
        name: validatedResult.name,
      });
      if (existingCategory) {
        return {
          status: false,
          message: `Menu Item Category with name "${validatedResult.name}" already exists`,
          code: 409,
        };
      }
      validatedResult.createdAt = new Date()
      const menuItemCategory = await MenuItemCategories.create(validatedResult);
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
    } catch (error: any) {
      throw error;
    }
  }
}
