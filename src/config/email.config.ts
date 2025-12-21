import nodemailer from 'nodemailer';

export const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,  // Use STARTTLS on port 587 (preferred for SMTP submission). Port 465 uses implicit TLS (secure: true).
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
});