import mongoose, { Schema, model, Document } from "mongoose";
//Document contains properties (_id, created_At, updated_At) of mongoose
export interface IUser extends Document {
    username : string;
    firstName: string;
    lastName: string;
    email: string;
    password ?: string; 
    phoneNumber?: string; // optional property
    role: "customer" | "admin" | "vendor";
    isEmailVerified: boolean;
    twoFactorTempSecret?: string;
    isTwoFactorEnabled : boolean;
    twoFactorSecret ?: string;
    googleId ?: string;
    facebookId ?: string;
    avatar ?:  { url: string , publicId?: string;};
    addresses ?: Array<{
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        isDefault: boolean;
    }>;
    verificationCode?: string,
    verificationCodeExpiresAt?:Date,
    isActive : boolean;
    lastLogin ?: Date;
    resetPasswordToken ?: string,
    resetPasswordExpiresAt ?: Date,
    createdAt: Date;
    updatedAt : Date;
}; 

const userSchema: Schema<IUser> = new Schema({
    username:{
        type: String,
        required: [true, "Username is required"],
        unique: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username cannot exceed 30 characters"],
        trim: true
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true
    },
    lastName:{
        type: String,
        required: [true, "Last name is required"],
        trim: true
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email address"
        ]
    },
    password:{
        type: String,
        minlength: [6, "Password must be at least 6 characters"],
        select: false // don`t return password field by default
    },
    phoneNumber: {
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    role:{
        type: String,
        enum: ["customer","admin", "vendor"],
        default: "customer"
    },
    isEmailVerified: { 
        type: Boolean, 
        default: false 
    },
    isTwoFactorEnabled: { 
        type: Boolean, 
        default: false 
    },
    twoFactorTempSecret:{
        type: String
    },
    twoFactorSecret: { type: String },
    googleId: { type: String },
    facebookId: { type: String },
    avatar:{
        url: { type: String },
        publicId: { type: String }
    },
    addresses:[{
        street: {type: String},
        city: {type: String},
        state: {type: String},
        zipCode: {type: String},
        country: {type: String},
        isDefault: { type: Boolean, default: false },
    }],
    verificationCode :{
        type:String,
        trim: true,
        unique:true,
        sparse: true
    },
    verificationCodeExpiresAt:{
        type: Date,
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    resetPasswordToken:{
        type:String,
        trim: true,
        unique:true,
        sparse: true
    },
    resetPasswordExpiresAt:{
        type: Date,
    }
},{
    timestamps: true,
});

const userModel = mongoose.models.User || model<IUser>("User", userSchema); // to avoid model overwrite issue in watch mode
export default userModel;