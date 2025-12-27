import * as authController from '../controller/auth.controller.js';
import {Router} from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import * as authValidation from "../validators/auth.validator.js";
import validation from '../middlewares/validate.middleware.js';
import passport from "passport";
import ratelimiter from '../middlewares/rateLimiter.middleware.js';
const router = Router();

router.post('/',ratelimiter({windowMs:15*60*1000,max:5}),validation(authValidation.registerSchema),asyncHandler(authController.register));
router.post('/verifyEmail',validation(authValidation.verifyEmailSchema),asyncHandler(authController.isEmailVerified));
router.post('/login',ratelimiter({windowMs:15*60*1000,max:10}),validation(authValidation.loginSchema),asyncHandler(authController.login));
router.post('/logout',authenticate,asyncHandler(authController.logout));

router.post('/forgetPassword',ratelimiter({windowMs:15*60*1000,max:5}),validation(authValidation.forgotPasswordSchema),asyncHandler(authController.forgetPassword));
router.post('/resetPassword/:token',ratelimiter({windowMs:15*60*1000,max:5}),validation(authValidation.resetPasswordSchema),asyncHandler(authController.resetPassword));


router.post('/refresh',asyncHandler(authController.refreshToken));

router.post('/2fa/enable',authenticate,asyncHandler(authController.enable2FA));
router.post('/2fa/verify',authenticate,validation(authValidation.verify2FASchema),asyncHandler(authController.verify2FA));
router.post('/2fa/verify-login',ratelimiter({windowMs:15*60*1000,max:5}),validation(authValidation.verify2FALoginSchema),asyncHandler(authController.verify2FALogin));
router.post('/2fa/disable',authenticate,validation(authValidation.disable2FASchema),asyncHandler(authController.disable2FA));

router.get('/google/',ratelimiter({windowMs:15*60*1000,max:5}),passport.authenticate('google',{scope:['profile','email'],session:false}));
router.get('/google/callback',passport.authenticate('google',{failureMessage:true,session:false}),asyncHandler(authController.googleCallback));

router.get('/facebook/',ratelimiter({windowMs:15*60*1000,max:5}),passport.authenticate('facebook',{scope:['email'],session:false}));
router.get('/facebook/callback',passport.authenticate('facebook',{failureMessage:true,session:false}),asyncHandler(authController.facebookCallback));



export default router;