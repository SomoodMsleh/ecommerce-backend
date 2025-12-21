import bcryptjs from "bcryptjs";
import ApiError from "./error.util.js";
export const hashPassword = async (password: string): Promise<string> =>{
    const salt = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    if (!password) {
        throw new ApiError("Password is required", 400);
    }
    return bcryptjs.hash(password,salt);
};

export const comparePassword = async(password:string,hashPassword:string):Promise<boolean>=>{
    return await bcryptjs.compare(password,hashPassword);
}