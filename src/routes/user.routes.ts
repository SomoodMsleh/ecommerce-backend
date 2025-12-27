import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import validation from '../middlewares/validate.middleware.js';
import * as userController from "../controller/user.controller.js";
import fileUpload from "../middlewares/upload.middleware.js";

const router = Router();

router.get('/profile',authenticate,asyncHandler(userController.getProfile));
router.put('/profile',authenticate,asyncHandler(userController.updateProfile));




export default router;