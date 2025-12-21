import bcryptjs from "bcryptjs";
import ApiError from "./error.util.js";
export const hashPassword = async (password: string): Promise<string> =>{
    const salt = process.env.SALT || ""
    if (!salt){ 
        throw new ApiError("Internal server error", 500);
    }
    return bcryptjs.hash(password,parseInt(salt));
};

export const comparePassword = async(password:string,hashPassword:string):Promise<boolean>=>{
    return await bcryptjs.compare(password,hashPassword);
}