import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import validation from '../middlewares/validate.middleware.js';
import * as userController from "../controller/user.controller.js";
import fileUpload ,{fileValidation} from "../middlewares/upload.middleware.js";

const router = Router();

router.get('/profile',authenticate,asyncHandler(userController.getProfile));
router.put('/profile',authenticate,asyncHandler(userController.updateProfile));


router.post('/avatar',authenticate,fileUpload(fileValidation.image).single('avatar'),asyncHandler(userController.uploadAvatar));
router.delete('/avatar',authenticate,asyncHandler(userController.deleteAvatar));

router.get('/addresses',authenticate,asyncHandler(userController.getAddresses));
router.post('/addresses',authenticate,asyncHandler(userController.addAddresses));
router.put('/addresses/:addressId',authenticate,asyncHandler(userController.updateAddress));
router.delete('/addresses/:addressId',authenticate,asyncHandler(userController.deleteAddress));


export default router;