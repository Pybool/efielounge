import express from 'express';
import accountController from '../../controllers/v1/Account/account.controller';
import { decode } from '../../middlewares/jwt';
import { handleInvalidMethod } from '../../middlewares/invalidrequest';
import { getMulterConfigSingle } from '../../middlewares/menu.middleware';
const authRouter = express.Router();

authRouter.get('/user-profile', decode, accountController.getUserProfile)
authRouter.put('/user-profile', decode, getMulterConfigSingle('../public/accounts/'), accountController.saveUserProfile)

authRouter.all('/user-profile', handleInvalidMethod);
authRouter.all('/user-profile', handleInvalidMethod);
export default authRouter;

