import express from 'express';
import accountController from '../../controllers/v1/Account/account.controller';
import { decode } from '../../middlewares/jwt';
import { handleInvalidMethod } from '../../middlewares/invalidrequest';
import { getMulterConfigSingle } from '../../middlewares/menu.middleware';
const authRouter = express.Router();

authRouter.get('/user-profile', decode, accountController.getUserProfile)
authRouter.put('/user-profile', decode, getMulterConfigSingle('../public/accounts/admin/'), accountController.saveUserProfile)
authRouter.post('/upload-avatar', decode, getMulterConfigSingle('../public/accounts/customers/'), accountController.uploadAvatar)
authRouter.post('/add-address', decode, accountController.addAddress)
authRouter.get('/get-addresses', decode, accountController.getAddresses)
authRouter.post('/set-default-address', decode, accountController.setDefaultAddress)
authRouter.post('/remove-address', decode, accountController.removeAddress)



authRouter.all('/user-profile', handleInvalidMethod);
export default authRouter;

