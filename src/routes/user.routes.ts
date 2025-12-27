import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import validation from '../middlewares/validate.middleware.js';


const router = Router();






export default router;