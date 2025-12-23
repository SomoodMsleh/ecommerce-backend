import * as authController from '../controller/auth.controller.js';
import {Router} from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
const router = Router();

router.post('/',asyncHandler(authController.register));
router.post('/verifyEmail',asyncHandler(authController.isEmailVerified));
router.post('/login',asyncHandler(authController.login));

router.post('/forgetPassword',asyncHandler(authController.forgetPassword));
router.post('/resetPassword/:token',asyncHandler(authController.resetPassword));
export default router;