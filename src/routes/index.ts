import {Router} from 'express';
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
const router = Router();

router.use('/auth',authRoutes);
router.use('/users',userRoutes);
router.use('/categories',categoryRoutes);

export default router;