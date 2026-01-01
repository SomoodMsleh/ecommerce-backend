import Joi from "joi";

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phoneNumber: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Phone number must be in valid international format',
        }),
});

export const addressBaseSchema = {
    street: Joi.string().trim().min(3).max(255),
    city: Joi.string().trim().min(2).max(100),
    state: Joi.string().trim().min(2).max(100),
    zipCode: Joi.string().trim().min(3).max(20),
    country: Joi.string().trim().min(2).max(100),
    isDefault: Joi.boolean(),
};

export const addAddressSchema = Joi.object({
    address: Joi.object({
        street: addressBaseSchema.street.required(),
        city: addressBaseSchema.city.required(),
        state: addressBaseSchema.state.required(),
        zipCode: addressBaseSchema.zipCode.required(),
        country: addressBaseSchema.country.required(),
        isDefault: addressBaseSchema.isDefault.optional(),
    }).required(),
});

export const updateAddressSchema = Joi.object({
    address: Joi.object({
        street: addressBaseSchema.street.optional(),
        city: addressBaseSchema.city.optional(),
        state: addressBaseSchema.state.optional(),
        zipCode: addressBaseSchema.zipCode.optional(),
        country: addressBaseSchema.country.optional(),
        isDefault: addressBaseSchema.isDefault.optional(),
    }).min(1).required(),
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().min(8).max(128).optional(),
    newPassword: Joi.string().min(8).max(128).pattern(/[A-Z]/, "uppercase letter").pattern(/[a-z]/, "lowercase letter").pattern(/[0-9]/, "number").pattern(/[^A-Za-z0-9]/, "special character").required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).optional(),
});

export const deleteAccountSchema = Joi.object({
    password: Joi.string().min(8).max(128).optional(),
    otp: Joi.string().length(6).pattern(/^\d+$/).optional(),
}).min(1).messages({ "object.min": "Password or OTP is required", });
