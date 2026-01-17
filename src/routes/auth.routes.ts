import * as authController from '../controller/auth.controller.js';
import {Router} from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import * as authValidation from "../validators/auth.validator.js";
import validation from '../middlewares/validate.middleware.js';
import passport from "passport";
import ratelimiter from '../middlewares/rateLimiter.middleware.js';
const router = Router();

router.post('/',
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 5, message: "Too many registration attempts, please try again later" }),
    validation(authValidation.registerSchema),
    asyncHandler(authController.register
));


router.post('/verifyEmail',
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    validation(authValidation.verifyEmailSchema),
    asyncHandler(authController.isEmailVerified)
);

router.post('/resendVerifyEmail',
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
    validation(authValidation.resendVerifyEmailSchema),
    asyncHandler(authController.resendVerifyEmail)
);

router.post('/login',
     ratelimiter({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many login attempts, please try again later" }),
    validation(authValidation.loginSchema),
    asyncHandler(authController.login)
);

router.post('/logout',
    authenticate,
    asyncHandler(authController.logout)
);

router.post('/forgetPassword',
    ratelimiter({ windowMs: 60 * 60 * 1000, max: 3, message: "Too many password reset requests, please try again later" }),
    validation(authValidation.forgotPasswordSchema),
    asyncHandler(authController.forgetPassword)
);

router.post('/resetPassword/:token',
    ratelimiter({ windowMs: 60 * 60 * 1000, max: 5 }),
    validation(authValidation.resetPasswordSchema),
    asyncHandler(authController.resetPassword)
);


router.post('/refresh',
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
    asyncHandler(authController.refreshToken)
);

router.post('/2fa/enable',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
    asyncHandler(authController.enable2FA)
);

router.post('/2fa/verify',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    validation(authValidation.verify2FASchema),
    asyncHandler(authController.verify2FA)
);

router.post('/2fa/verify-login',
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many 2FA verification attempts" }),
    validation(authValidation.verify2FALoginSchema),
    asyncHandler(authController.verify2FALogin)
);

router.post('/2fa/disable',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
    validation(authValidation.disable2FASchema),
    asyncHandler(authController.disable2FA)
);

router.get('/google/',
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    passport.authenticate('google',{scope:['profile','email'],session:false})
);

router.get('/google/callback',
    passport.authenticate('google',{failureMessage:true,session:false}),
    asyncHandler(authController.googleCallback)
);

router.get('/facebook/',
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    passport.authenticate('facebook',{scope:['email'],session:false})
);

router.get('/facebook/callback',
    passport.authenticate('facebook',{failureMessage:true,session:false}),
    asyncHandler(authController.facebookCallback)
);



export default router;