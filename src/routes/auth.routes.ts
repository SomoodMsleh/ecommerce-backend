import * as authController from '../controller/auth.controller.js';
import {Router} from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
const router = Router();

router.post('/',asyncHandler(authController.register));

export default router;