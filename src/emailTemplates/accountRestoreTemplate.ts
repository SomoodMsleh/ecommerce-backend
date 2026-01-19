export const accountRestoreRequestTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Account Deleted</h1>
        </div>
        <div class="content">
            <h2>We're Sorry to See You Go</h2>
            <p>Your account has been deactivated as requested. However, you have 30 days to restore your account if you change your mind.</p>
            <p>To restore your account, click the button below:</p>
            <a href="{restoreURL}" class="button">Restore Account</a>
            <p><strong>Important:</strong> After 30 days, your account and all associated data will be permanently deleted.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 E-Commerce API. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const accountRestoreSuccessTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { background: #10B981; color: white; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Account Restored Successfully!</h1>
        </div>
        <div class="content">
            <h2>Welcome Back!</h2>
            <p>Your account has been successfully restored. You can now log in and continue using our services.</p>
            <a href="{loginURL}" class="button">Login Now</a>
        </div>
        <div class="footer">
            <p>&copy; 2026 E-Commerce API. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;