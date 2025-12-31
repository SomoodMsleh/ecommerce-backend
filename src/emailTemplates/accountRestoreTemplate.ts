export const accountRestoreRequestTemplate = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Restore Your Account</title>
    </head>
    <body style=" font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; ">
        <!-- Header -->
        <div style=" background: linear-gradient(to right, #ff9800, #f57c00); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Restore Your Account</h1>
        </div>

        <!-- Body -->
        <div style=" background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); " >
            <p>Hello,</p>
            <p> We received a request to delete your account. Your account has been <strong>temporarily deactivated</strong> and is scheduled for permanent deletion. </p>
            <p> You can restore your account within the next <strong>30 days</strong>. After that, all your data will be permanently removed and cannot be recovered.</p>
            <p>To restore your account, click the button below:</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{restoreURL}" style=" background-color: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Restore Account
                </a>
            </div>
            
            <p> If you did not request this action, please contact our support team immediately. </p>
            <p> Best regards,<br /> <strong>Your App Team</strong> </p>
        </div>

        <!-- Footer -->
        <div style=" text-align: center; margin-top: 20px; color: #888; font-size: 0.8em; ">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </body>
</html>
`;

export const accountRestoreSuccessTemplate = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Account Restored Successfully</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(to right, #4CAF50, #43A047); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Account Restored</h1>
        </div>

        <!-- Body -->
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <p>Hello,</p>

            <p>
                We’re happy to let you know that your account has been 
                <strong>successfully restored</strong>.
            </p>

            <p>
                You can now log in and continue using your account as usual.
                All your data and settings are fully available.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{loginURL}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Log In to Your Account
                </a>
            </div>

            <p>
                If you did not request this restoration, please contact our support team immediately.
            </p>

            <p>
                Best regards,<br />
                <strong>Your App Team</strong>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </body>
</html>
`;
