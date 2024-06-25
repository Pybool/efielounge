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
import MenuRatings from "../../../models/menu/ratings.model";
import MenuLikes from "../../../models/menu/likes.model";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Menuservice {
  static buildFilter(req: Xrequest) {
    try {
      if (req.query.filter) {
        if (req.query.field == "status") {
          return { status: req.query.filter };
        } else if (req.query.field == "category") {
          return { category: new Types.ObjectId(req.query.filter as string) };
        }
      }
      return {};
    } catch {
      return {};
    }
  }

  static async computeRating(menuId: string) {
    try {
      const ratings = await MenuRatings.find({ menuId });
      if (ratings.length === 0) {
        return 0;
      }

      const totalRating = ratings.reduce(
        (acc, rating: any) => acc + rating.rating,
        0
      );
      const averageRating = totalRating / ratings.length;
      return averageRating;
    } catch (error) {
      return 0;
    }
  }

  static async getMenus(req: Xrequest) {
    try {
      let filter: any = {};
      const page = Number((req.query.page! as string) || 1);
      const limit = Number((req.query.limit! as string) || 20);

      filter = Menuservice.buildFilter(req);
      const options = {
        page: page,
        limit: limit,
        sort: {},
      };

      const [menus, total] = await Promise.all([
        Menu.find(filter, null, options).sort({createdAt: -1}).populate("category").populate("menuItems"),
        Menu.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);
      for (const menu of menus) {
        menu.ratings = await Menuservice.computeRating(menu._id.toString());
        menu.likes = await MenuLikes.countDocuments({ menuId: menu._id });
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
    } catch (error: any) {
      throw error;
    }
  }

  static async getMenuCategories() {
    try {
      const categories = await MenuCategories.find({});
      return {
        status: true,
        message: "Categories fetched successfully",
        data: categories,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async getMenuItemCategories() {
    try {
      const categories = await MenuItemCategories.find({});
      return {
        status: true,
        message: "Menu Item Categories fetched successfully",
        data: categories,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async getMenuItems() {
    try {
      const menuItems = await MenuItem.find({}).populate("category");
      return {
        status: true,
        message: "Menu Item fetched successfully",
        data: menuItems,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async fetchMenuDetail(req:Xrequest){
    const slug = req.query.slug! as string;
    const menu: any = await Menu.findOne({
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
    }
  }
}
