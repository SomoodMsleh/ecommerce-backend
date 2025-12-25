import * as authController from '../controller/auth.controller.js';
import {Router} from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import * as authValidation from "../validators/auth.validator.js";
import validation from '../middlewares/validate.middleware.js';
const router = Router();

router.post('/',validation(authValidation.registerSchema),asyncHandler(authController.register));
router.post('/verifyEmail',validation(authValidation.verifyEmailSchema),asyncHandler(authController.isEmailVerified));
router.post('/login',validation(authValidation.loginSchema),asyncHandler(authController.login));
router.post('/logout',asyncHandler(authController.logout));

router.post('/forgetPassword',validation(authValidation.forgotPasswordSchema),asyncHandler(authController.forgetPassword));
router.post('/resetPassword/:token',validation(authValidation.resetPasswordSchema),asyncHandler(authController.resetPassword));


router.post('/refresh',asyncHandler(authController.refreshToken));

router.post('/2fa/enable',authenticate,asyncHandler(authController.enable2FA));
router.post('/2fa/verify',authenticate,validation(authValidation.verify2FASchema),asyncHandler(authController.verify2FA));
router.post('/2fa/verify-login',validation(authValidation.verify2FALoginSchema),asyncHandler(authController.verify2FALogin));
router.post('/2fa/disable',authenticate,validation(authValidation.disable2FASchema),asyncHandler(authController.disable2FA));


export default router;