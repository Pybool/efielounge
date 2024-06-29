import mongoose from "mongoose";
import Xrequest from "../../../interfaces/extensions.interface";
import Menu from "../../../models/menu/menu.model";
import MenuCategories from "../../../models/menu/menucategories.model";
import MenuItem from "../../../models/menu/menuitem.model";
import MenuRatings from "../../../models/menu/ratings.model";
import MenuLikes from "../../../models/menu/likes.model";


function calculateStartIndex(page: number, limit: number) {
  return (page - 1) * limit;
}

export class SearchMenuservice {
  static buildMenuFilter(searchString: string) {
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
    } catch {
      return {};
    }
  }

  static async getMatchingMenuItemsIds(searchString: string) {
    try {
      const words = searchString
        .split(" ")
        .map((word) => `(?=.*${word})`)
        .join("");
      const regex = new RegExp(words, "i"); // 'i' for case-insensitive
      const menuItemsIds = await MenuItem.find({
        name: { $regex: regex },
      }).select("_id");
      return menuItemsIds;
    } catch (error: any) {
      return [];
    }
  }

  static async getMatchingMenucategoryIds(searchString: string) {
    try {
      const words = searchString
        .split(" ")
        .map((word) => `(?=.*${word})`)
        .join("");
      const regex = new RegExp(words, "i"); // 'i' for case-insensitive
      const menuCategoriesIds = await MenuCategories.find({
        name: { $regex: regex },
      }).select("_id");
      return menuCategoriesIds;
    } catch (error: any) {
      return [];
    }
  }

  static async computeRating(menu: string) {
    try {
      const ratings = await MenuRatings.find({ menu });
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

  static async searchMenus(req: Xrequest) {
    try {
      let filter: any = {};
      const searchString: string = req.query.searchString as string;
      filter = SearchMenuservice.buildMenuFilter(searchString);
      const options = {};

      const [menus, total] = await Promise.all([
        Menu.find(filter, null, options)
          .sort({ createdAt: -1 })
          .populate("category")
          .populate("menuItems"),
        Menu.countDocuments(filter),
      ]);

      for (const menu of menus) {
        menu.ratings = await SearchMenuservice.computeRating(
          menu._id.toString()
        );
        menu.likes = await MenuLikes.countDocuments({ menuId: menu._id });
      }
      return menus;
    } catch (error: any) {
      throw error;
    }
  }

  static async searchByMenuCategories(req: Xrequest) {
    try {
      const aggregatedResults: any[] = [];
      const searchString: string = req.query.searchString! as string;
      const menuCategoriesIds =
        await SearchMenuservice.getMatchingMenucategoryIds(searchString);
      for (let menuCategoriesId of menuCategoriesIds) {
        const results = await Menu.find({
          category: new mongoose.Types.ObjectId(menuCategoriesId._id),
        })
          .populate("category")
          .populate("menuItems");
        aggregatedResults.push(...results);
      }

      for (const menu of [...aggregatedResults]) {
        menu.ratings = await SearchMenuservice.computeRating(
          menu?._id?.toString()
        );
        menu.likes = await MenuLikes.countDocuments({ menuId: menu?._id });
      }
      return [...aggregatedResults];
    } catch (error: any) {
      throw error;
    }
  }

  static async searchByMenuItems(req: Xrequest) {
    try {
      const aggregatedResults: any[] = [];
      const searchString: string = req.query.searchString! as string;
      const menuItemIds = await SearchMenuservice.getMatchingMenuItemsIds(
        searchString
      );
      for (let menuItemId of menuItemIds) {
        const results = await Menu.find({
          menuItems: new mongoose.Types.ObjectId(menuItemId._id),
        })
          .populate("category")
          .populate("menuItems");
        aggregatedResults.push(...results);
      }

      for (const menu of [...aggregatedResults]) {
        menu.ratings = await SearchMenuservice.computeRating(
          menu?._id?.toString()
        );
        menu.likes = await MenuLikes.countDocuments({ menuId: menu?._id });
      }
      return [...aggregatedResults];
    } catch (error: any) {
      throw error;
    }
  }

  static async searchMenuAndExtrasAndCategories(req: Xrequest) {
    try {
      const page = Number((req.query.page! as string) || 1);
      const limit = Number((req.query.limit! as string) || 20);

      const searchMenusResults = await SearchMenuservice.searchMenus(req);
      const searchByMenuItemsResults =
        await SearchMenuservice.searchByMenuItems(req);
      const searchByMenucategoriesResults =
        await SearchMenuservice.searchByMenuCategories(req);

      const aggregatedResults: any[] = [
        ...searchMenusResults,
        ...searchByMenuItemsResults,
        ...searchByMenucategoriesResults,
      ];
      const total: number = aggregatedResults.length;
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

      let searchResults:any = aggregatedResults.slice(startOffset, endOffset);
      if (page > totalPages) {
        searchResults = [];
      }

      const removeDuplicates = (array:any) => {
        const seen = new Set();
        return array.filter((item: any) => {
          const duplicate:any = seen.has(item._id.toString());
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
    } catch (error: any) {
      throw error;
    }
  }
}
