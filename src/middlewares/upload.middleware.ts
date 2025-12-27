import multer from "multer";
import ApiError from "../utils/error.util.js";
import { Request } from "express";


export const fileValidation ={
    image:['image/png','image/jpeg','image/jpg','image/webp'],
    pdf:['application/pdf'],
    excel:['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
} 

const fileUpload = (allowedTypes: string[] = [])=>{
    const storage = multer.memoryStorage();
    function fileFilter(req:Request,file:Express.Multer.File,cb:multer.FileFilterCallback){
        if (allowedTypes.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb(new ApiError('Invalid file format', 400))
        }
    }
    const upload = multer({fileFilter,storage,limits:{fileSize:5*1024*1024}});
    return upload;
}

export default fileUpload;