import { emailTransporter } from "../config/email.config.js";
import logger from "../utils/logger.util.js";
import ApiError from "../utils/error.util.js";
interface emailOptions{
    to:string,
    subject: string;
    html: string;
}

export const sendEmail = async(options:emailOptions):Promise<void>=>{
    try{
        await emailTransporter.sendMail({
            from:process.env.EMAIL_FROM,
            to:options.to,
            subject:options.subject,
            html:options.html
        });
        logger.info(`Email sent ${options.subject} to ${options.to}`);
    }catch(error){
        logger.error('Email sending failed:', error);
        throw new ApiError("Email service unavailable", 500);
    }
}