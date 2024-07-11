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

const slugify = (menuName: string) => {
  return menuName
    .toString() // Convert to string
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .replace(/[\s\W-]+/g, "-") // Replace spaces, non-word characters, and hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
};

async function slugifyAllRecords() {
  const menus = await Menu.find({});
  menus.forEach(async (menu: any) => {
    menu.slug = slugify(menu.name);
    await menu.save();
  });
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
          code: 400,
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
      validatedResult.slug = slugify(validatedResult.name);
      validatedResult.createdAt = new Date();
      const menu = await Menu.create(validatedResult);
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
    } catch (error: any) {
      throw error;
    }
  }

  static async editMenu(req: Xrequest) {
    try {
      const validatedResult: any = await validations.menuSchema.validateAsync(
        req.body!
      );
      const menu: any = await Menu.findOne({
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
        const updated = await Menu.findOneAndUpdate(
          { _id: validatedResult._id },
          validatedResult,
          { new: true }
        );
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
    } catch (error: any) {
      throw error;
    }
  }

  static async archiveMenu(req: Xrequest) {
    try {
      const data = req.body;
      const menu: any = await Menu.findOne({
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
    } catch (error: any) {
      throw error;
    }
  }

  static async createMenuItem(req: Xrequest) {
    try {
      const requestBody = req.body;
      console.log(requestBody.data);
      const requestBodyData = JSON.parse(requestBody.data);
      const validatedResult: ImenuItem =
        await validations.menuItemSchema.validateAsync(requestBodyData);
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
          code: 400,
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

  static async editMenuItem(req: Xrequest) {
    try {
      const validatedResult: ImenuItem =
        await validations.menuItemSchema.validateAsync(req.body!);
      const menuItem: any = await MenuItem.findOne({
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
        const updated = await MenuItem.findOneAndUpdate(
          { _id: validatedResult._id },
          validatedResult,
          { new: true }
        );
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
    } catch (error: any) {
      throw error;
    }
  }

  static async archiveMenuItem(req: Xrequest) {
    try {
      const data = req.body;
      const menuItem: any = await MenuItem.findOne({
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
    } catch (error: any) {
      throw error;
    }
  }

  static async createMenuItemCategory(req: Xrequest) {
    try {
      const validatedResult: ImenuItemCategory =
        await validations.menuItemCategoriesSchema.validateAsync(req.body!);
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
      validatedResult.createdAt = new Date();
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

  static async editMenuItemCategory(req: Xrequest) {
    try {
      const validatedResult: ImenuItemCategory =
        await validations.menuItemCategoriesSchema.validateAsync(req.body!);
      const menuItemCategory: any = await MenuItemCategories.findOne({
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
    } catch (error: any) {
      throw error;
    }
  }

  static async archiveMenuItemCategory(req: Xrequest) {
    try {
      const data = req.body;
      const menuItemCategory: any = await MenuItemCategories.findOne({
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
    } catch (error: any) {
      throw error;
    }
  }

  static async createMenuCategory(req: Xrequest) {
    try {
      const validatedResult: ImenuCategory =
        await validations.menuCategoriesSchema.validateAsync(req.body!);
      const existingCategory: any = await MenuCategories.findOne({
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

  static async editMenuCategory(req: Xrequest) {
    try {
      const validatedResult: any =
        await validations.menuCategoriesSchema.validateAsync(req.body!);
      const menuCategory: any = await MenuCategories.findOne({
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
    } catch (error: any) {
      throw error;
    }
  }

  static async archiveMenuCategory(req: Xrequest) {
    try {
      const data = req.body;
      const menuCategory: any = await MenuCategories.findOne({
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
    } catch (error: any) {
      throw error;
    }
  }
}
