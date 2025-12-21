import {Response} from "express";
export const successResponse = <T>(res:Response, statusCode:number, message:string, data?:T):void=>{
    const response :any = {success : true, message}
    if(data !== undefined){
        response.data = data;
    }
    res.status(statusCode).json();
};

export const paginatedResponse = ()=>{

};