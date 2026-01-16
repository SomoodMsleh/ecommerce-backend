import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import validation from '../middlewares/validate.middleware.js';
import * as userController from "../controller/user.controller.js";
import fileUpload ,{fileValidation} from "../middlewares/upload.middleware.js";
import * as userValidation from "../validators/user.validator.js";
import ratelimiter from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.get('/profile',authenticate,asyncHandler(userController.getProfile));
router.put('/profile',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    validation(userValidation.updateProfileSchema),
    asyncHandler(userController.updateProfile)
);


router.post('/avatar',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 5, message: "Too many upload attempts" }),
    fileUpload(fileValidation.image).single('avatar'),
    asyncHandler(userController.uploadAvatar)
);
router.delete('/avatar',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    asyncHandler(userController.deleteAvatar)
);

router.get('/addresses',authenticate,asyncHandler(userController.getAddresses));

router.post('/addresses',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 15 }),
    validation(userValidation.addAddressSchema),
    asyncHandler(userController.addAddresses)
);

router.put('/addresses/:addressId',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    validation(userValidation.updateAddressSchema),
    asyncHandler(userController.updateAddress)
);

router.delete('/addresses/:addressId',
    authenticate,
    ratelimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    asyncHandler(userController.deleteAddress)
);

router.put('/changePassword',
    authenticate,
    ratelimiter({ windowMs: 60 * 60 * 1000, max: 5, message: "Too many password change attempts" }),
    validation(userValidation.changePasswordSchema),
    asyncHandler(userController.changePassword)
);

router.delete('/account/delete',
    authenticate,
    ratelimiter({ windowMs: 60 * 60 * 1000, max: 3, message: "Too many account deletion attempts" }),
    validation(userValidation.deleteAccountSchema),
    asyncHandler(userController.deleteAccount)
);
router.get('/account/restore/:restoreToken',
    ratelimiter({ windowMs: 60 * 60 * 1000, max: 5 }),    
    asyncHandler(userController.restoreAccount)
);
export default router;