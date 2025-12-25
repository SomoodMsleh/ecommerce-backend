import * as authController from '../controller/auth.controller.js';
import {Router} from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
const router = Router();

router.post('/',asyncHandler(authController.register));
router.post('/verifyEmail',asyncHandler(authController.isEmailVerified));
router.post('/login',asyncHandler(authController.login));

router.post('/forgetPassword',asyncHandler(authController.forgetPassword));
router.post('/resetPassword/:token',asyncHandler(authController.resetPassword));
router.post('/logout',asyncHandler(authController.logout));

router.post('/refresh',asyncHandler(authController.refreshToken));
router.post('/2fa/enable',authenticate,asyncHandler(authController.enable2FA));
export default router;