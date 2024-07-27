import Xrequest from "../../../interfaces/extensions.interface";
import { Ipromotion } from "../../../interfaces/promotions.interface";
import Promotions from "../../../models/promotions.model";
import validations from "../../../validators/admin/promotions.validator";

export class PromotionService {
  static async createPromotion(req: Xrequest) {
    try {
      const requestBody = req.body;
      console.log(req.attachments)
      const requestBodyData = JSON.parse(requestBody.data);

      let promotionAttachments = req.attachments!;
      requestBodyData.attachments = promotionAttachments;
      if (
        promotionAttachments.length == 0 ||
        req.files.length != promotionAttachments.length
      ) {
        return {
          status: false,
          message: "Promotion creation failed, no valid images were sent",
          data: null,
          code: 422,
        };
      }
      const validatedResult: Ipromotion =
        await validations.promotionCreationSchema.validateAsync(
          requestBodyData
        );

      validatedResult.createdAt = new Date();

      const promotion = await Promotions.create(validatedResult);
      if (promotion) {
        return {
          status: true,
          message: "Promotion has been created succesfully.",
          data: promotion,
          code: 201,
        };
      }
      return {
        status: false,
        message: "Promotion creation failed.",
        data: null,
        code: 422,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async activatePromotion(req: Xrequest) {
    try {
      let msg = "de-activation";
      const validatedResult =
        await validations.promotionActivationSchema.validateAsync(req.body);

      if (validatedResult.isActive) {
        msg = "activation";
      }

      const promotion = await Promotions.findOneAndUpdate(
        { _id: validatedResult._id },
        validatedResult,
        { new: true }
      );

      if (promotion) {
        return {
          status: true,
          message: `Promotion ${msg} was successfull`,
          data: promotion,
          code: 200,
        };
      }
      return {
        status: false,
        message: `Promotion ${msg} failed`,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async deletePromotion(req: Xrequest) {
    try {
      const validatedResult =
        await validations.promotionDeletionSchema.validateAsync(req.body);

      const promotion = await Promotions.findOneAndDelete({
        _id: validatedResult._id,
      });

      if (promotion) {
        return {
          status: true,
          message: `Promotion was deleted successfully`,
          data: promotion,
          code: 200,
        };
      }
      return {
        status: false,
        message: `Promotion could not be deleted`,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
