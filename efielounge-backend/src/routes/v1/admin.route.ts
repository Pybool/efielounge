import express from "express";
import {
  getMulterConfig,
  getMulterConfigSingle,
} from "../../middlewares/menu.middleware";
import menuController from "../../controllers/v1/Admin/menu.controller";
import { decode, decodeExt, ensureAdmin } from "../../middlewares/jwt";
import accountController from "../../controllers/v1/Account/account.controller";
import Xrequest from "../../interfaces/extensions.interface";
import Home from "../../models/home.model";
import clientOrderController from "../../controllers/v1/Orders/orders.controller";
import promotionsController from "../../controllers/v1/Admin/promotion.controller";
import Promotions from "../../models/promotions.model";

const adminRouter = express.Router();

adminRouter.post(
  "/menu/create-menu",
  decode,
  ensureAdmin,
  getMulterConfig(),
  menuController.createMenu
);
adminRouter.put(
  "/menu/edit-menu",
  decode,
  ensureAdmin,
  menuController.editMenu
);
adminRouter.patch(
  "/menu/archive-menu",
  decode,
  ensureAdmin,
  menuController.archiveMenu
);

adminRouter.post(
  "/menu/create-menu-category",
  decode,
  ensureAdmin,
  menuController.createMenuCategory
);
adminRouter.put(
  "/menu/edit-menu-category",
  decode,
  ensureAdmin,
  menuController.editMenuCategory
);
adminRouter.patch(
  "/menu/archive-menu-category",
  decode,
  ensureAdmin,
  menuController.archiveMenuCategory
);

adminRouter.post(
  "/menu/create-menu-item",
  decode,
  ensureAdmin,
  getMulterConfig(),
  menuController.createMenuItem
);
adminRouter.put(
  "/menu/edit-menu-item",
  decode,
  ensureAdmin,
  menuController.editMenuItem
);
adminRouter.patch(
  "/menu/archive-menu-item",
  decode,
  ensureAdmin,
  menuController.archiveMenuItem
);

adminRouter.post(
  "/menu/create-menu-item-category",
  decode,
  ensureAdmin,
  menuController.createMenuItemCategory
);
adminRouter.put(
  "/menu/edit-menu-item-category",
  decode,
  ensureAdmin,
  menuController.editMenuItemCategory
);
adminRouter.patch(
  "/menu/archive-menu-item-category",
  decode,
  ensureAdmin,
  menuController.archiveMenuItemCategory
);

adminRouter.patch(
  "/orders/update-order-status",
  decode,
  ensureAdmin,
  clientOrderController.updateOrderStatus
);

adminRouter.get(
  "/accounts/get-customers",
  decode,
  ensureAdmin,
  accountController.getCustomers
);
adminRouter.get(
  "/accounts/get-staff",
  decode,
  ensureAdmin,
  accountController.getStaff
);

adminRouter.post(
  "/website/create-promotion",
  decode,
  ensureAdmin,
  getMulterConfig("../efielounge-backend/public/website/promotions/", "object"),
  promotionsController.createPromotion
);

adminRouter.patch(
  "/website/activate-promotion",
  decode,
  ensureAdmin,
  promotionsController.activatePromotion
);

adminRouter.post(
  "/website/delete-promotion",
  decode,
  ensureAdmin,
  promotionsController.deletePromotion
);

adminRouter.get(
  "/get-client-home",
  decodeExt,
  async (req: Xrequest, res: any) => {
    try {
      let filter:{isActive?:boolean} = { isActive: true };
      const account = req.account!;
      if (account && account.role === "ADMIN") {
        filter = {};
      }

      const home = await Home.findOne({});
      const promotions = await Promotions.find(filter).sort({ createdAt: -1 });
      if (home) {
        return res.send({
          status: true,
          message: "Home fetched",
          home,
          promotions,
        });
      } else {
        return res.send({
          status: false,
          message: "failed to fetch home data",
        });
      }
    } catch {
      return res.send({
        status: false,
        message: "failed to fetch home data",
      });
    }
  }
);

adminRouter.post(
  "/change-banner-image",
  decode,
  ensureAdmin,
  getMulterConfigSingle("../efielounge-backend/public/home/"),
  async (req: Xrequest, res: any) => {
    try {
      const home = await Home.findOne({});
      const images = req.attachments;
      if (home) {
        if (images.length > 0) {
          home.banner = images[0];
          await home.save();
          return res.send({
            status: true,
            message: "Banner was saved",
            banner: home.banner,
          });
        }
        return res.send({
          status: false,
          message: "failed to update banner, no image was provided",
        });
      } else {
        const home = await Home.create({ banner: images[0] });
        return res.send({
          status: true,
          message: "Banner was saved",
          banner: home.banner,
        });
      }
    } catch {
      return res.send({
        status: false,
        message: "failed to update banner, an error occured",
      });
    }
  }
);

export default adminRouter;
