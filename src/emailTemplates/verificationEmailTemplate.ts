export const verificationEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .code { background: #4F46E5; color: white; font-size: 32px; font-weight: bold; padding: 15px; text-align: center; letter-spacing: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to E-Commerce API!</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering! Please use the verification code below to complete your registration:</p>
            <div class="code">{verificationCode}</div>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 E-Commerce API. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (username: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Email Verified Successfully!</h1>
        </div>
        <div class="content">
            <h2>Welcome ${username}!</h2>
            <p>Your email has been verified successfully. You can now access all features of our platform.</p>
            <p>Here's what you can do:</p>
            <ul>
                <li>Browse thousands of products</li>
                <li>Add items to your cart and wishlist</li>
                <li>Place orders securely</li>
                <li>Track your orders in real-time</li>
                <li>Write reviews and ratings</li>
            </ul>
            <p>Happy shopping!</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 E-Commerce API. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
