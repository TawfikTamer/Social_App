export const VERIFICATION_EMAIL = (otp: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">🔐</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Email Verification</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Hello there! 👋</p>
    <p style="color: #666; font-size: 16px;">Thank you for joining us! To complete your registration, please use the verification code below:</p>
    
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); margin: 35px 0; padding: 25px; border-radius: 12px; text-align: center; position: relative;">
      <p style="color: white; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Verification Code</p>
      <div style="background: rgba(255,255,255,0.95); padding: 15px 25px; border-radius: 8px; margin: 0 auto; display: inline-block;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">${otp}</span>
      </div>
    </div>
    
    <div style="background: linear-gradient(90deg, #e3f2fd 0%, #f3e5f5 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>💡 Pro tip:</strong> Enter this code on the verification page within the next 15 minutes.
      </p>
    </div>
    
    <p style="color: #777; font-size: 15px;">If you didn't create an account with us, please disregard this email - no further action is required.</p>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #667eea;">Best regards,</strong><br>
        <span style="color: #764ba2; font-weight: 500;">The Verification Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated message - please do not reply to this email
    </p>
    <div style="margin-top: 15px;">
      <span style="color: #ccc; font-size: 12px;">Secured by SSL encryption</span>
    </div>
  </div>
</body>
</html>
`;
};

export const WELCOME_EMAIL = (userName: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our App</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(0, 198, 255, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">🎉</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Welcome Aboard!</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Hi <strong style="color: #0072ff;">${userName}</strong>! 👋</p>
    <p style="color: #666; font-size: 16px;">We're excited to let you know that your email has been successfully verified! ✨</p>
    
    <div style="background: linear-gradient(90deg, #e8f5e8 0%, #f0f8f0 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #00c851; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 15px;">
        <strong>🚀 You're all set!</strong> Welcome to our community - you can now enjoy all the features of our platform.
      </p>
    </div>
    
    <p style="color: #777; font-size: 15px;">If you have any questions, feel free to reply to this email — our support team is here to help! 💬</p>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #0072ff;">Best regards,</strong><br>
        <span style="color: #00c6ff; font-weight: 500;">Support Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This message was sent automatically
    </p>
  </div>
</body>
</html>
`;
};

export const PASSWORD_CHANGED = (): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #00c851 0%, #007e33 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(0, 200, 81, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">🔒</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Password Updated</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Hello there! 👋</p>
    <p style="color: #666; font-size: 16px;">We're writing to confirm that your password has been successfully changed.</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <div style="background: linear-gradient(135deg, #00c851 0%, #007e33 100%); color: white; width: 80px; height: 80px; line-height: 80px; border-radius: 50%; display: inline-block; font-size: 40px; box-shadow: 0 4px 15px rgba(0, 200, 81, 0.3);">
        ✓
      </div>
    </div>
    
    <div style="background: linear-gradient(90deg, #fff3cd 0%, #ffeaa7 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #ff6b35; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-size: 15px; font-weight: bold;">
        ⚠️ Security Alert
      </p>
      <p style="margin: 0; color: #666; font-size: 14px;">
        If you didn't initiate this action, please contact our support team immediately.
      </p>
    </div>
    
    <p style="color: #777; font-size: 15px;">For security reasons, we recommend that you:</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 8px;">🔐 Use a strong, unique password</li>
        <li style="margin-bottom: 8px;">📱 Enable two-factor authentication if available</li>
        <li style="margin-bottom: 0;">🚫 Avoid using the same password across multiple sites</li>
      </ul>
    </div>
    
    <p style="color: #777; font-size: 15px;">Thank you for helping us keep your account secure! 🛡️</p>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #00c851;">Best regards,</strong><br>
        <span style="color: #007e33; font-weight: 500;">Security Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated message, please do not reply to this email
    </p>
  </div>
</body>
</html>
`;
};

export const PASSWORD_RESET_REQUEST = (otp: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">🔑</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Password Reset</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Hello there! 👋</p>
    <p style="color: #666; font-size: 16px;">We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    
    <div style="background: linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #ff6b6b; margin: 25px 0;">
      <p style="margin: 0; color: #333; font-size: 14px;">
        <strong>⏰ Time-sensitive:</strong> Use this code within the next 15 minutes to reset your password.
      </p>
    </div>
    
    <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 10px;">Your reset code is:</p>
    
    <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); margin: 35px 0; padding: 25px; border-radius: 12px; text-align: center; position: relative;">
      <p style="color: #333; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8;">Reset Code</p>
      <div style="background: rgba(255,255,255,0.95); padding: 15px 25px; border-radius: 8px; margin: 0 auto; display: inline-block;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">${otp}</span>
      </div>
    </div>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #ff6b6b;">Best regards,</strong><br>
        <span style="color: #ee5a24; font-weight: 500;">Security Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated message, please do not reply to this email
    </p>
    <div style="margin-top: 15px;">
      <span style="color: #ccc; font-size: 12px;">Secured by SSL encryption</span>
    </div>
  </div>
</body>
</html>
`;
};

export const CHANGE_EMAIL_VERIFICATION = (
  otp: string,
  newEmail: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Email Change</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">✉️</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Email Change Request</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Hello! 👋</p>
    <p style="color: #666; font-size: 16px;">We received a request to change your account email address to:</p>
    
    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #667eea; font-size: 16px; font-weight: 600;">${newEmail}</p>
    </div>
    
    <p style="color: #666; font-size: 16px;">To confirm this change and verify your new email address, please use the verification code below:</p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 35px 0; padding: 25px; border-radius: 12px; text-align: center; position: relative;">
      <p style="color: white; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Verification Code</p>
      <div style="background: rgba(255,255,255,0.95); padding: 15px 25px; border-radius: 8px; margin: 0 auto; display: inline-block;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">${otp}</span>
      </div>
    </div>
    
    <div style="background: linear-gradient(90deg, #fff3e0 0%, #ffe0b2 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #ff9800; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>⚠️ Important:</strong> This code will expire in 15 minutes. If you didn't request this change, please ignore this email and your account will remain secure.
      </p>
    </div>
    
    <p style="color: #777; font-size: 15px;">Once verified, this email address will become your new login credential and all future communications will be sent here.</p>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #667eea;">Best regards,</strong><br>
        <span style="color: #764ba2; font-weight: 500;">The Security Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated message - please do not reply to this email
    </p>
    <div style="margin-top: 15px;">
      <span style="color: #ccc; font-size: 12px;">Secured by SSL encryption</span>
    </div>
  </div>
</body>
</html>
`;
};

export const EMAIL_UPDATED_NOTIFICATION = (
  oldEmail: string,
  updatedAt: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Successfully Updated</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">✅</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Email Successfully Updated</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Hello! 👋</p>
    <p style="color: #666; font-size: 16px;">This is to confirm that your email address has been successfully updated.</p>
    
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 30px 0;">
      <div style="margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Previous Email</p>
        <p style="margin: 0; color: #555; font-size: 16px; text-decoration: line-through; opacity: 0.7;">${oldEmail}</p>
      </div>
      
      <div style="text-align: center; margin: 15px 0;">
        <span style="font-size: 24px;">⬇️</span>
      </div>
      
      <div>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">New Email</p>
        <p style="margin: 0; color: #11998e; font-size: 16px; font-weight: 600;">This email address</p>
      </div>
    </div>
    
    <div style="background: linear-gradient(90deg, #e3f2fd 0%, #e1f5fe 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #03a9f4; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">
        <strong>📅 Updated on:</strong> ${updatedAt}
      </p>
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>💡 What's next:</strong> Use this new email address for all future logins and communications.
      </p>
    </div>
    
    <div style="background: linear-gradient(90deg, #fff3e0 0%, #ffe0b2 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #ff9800; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>⚠️ Didn't make this change?</strong> If you did not authorize this update, please contact our support team immediately to secure your account.
      </p>
    </div>
    
    <p style="color: #777; font-size: 15px;">All future notifications and communications will be sent to your new email address.</p>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #11998e;">Best regards,</strong><br>
        <span style="color: #38ef7d; font-weight: 500;">The Account Security Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated message - please do not reply to this email
    </p>
    <div style="margin-top: 15px;">
      <span style="color: #ccc; font-size: 12px;">Secured by SSL encryption</span>
    </div>
  </div>
</body>
</html>
`;
};

export const USER_MENTION_NOTIFICATION = (mentionedBy: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Mentioned</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">@</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">You've Been Mentioned!</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Hey there! 👋</p>
    <p style="color: #666; font-size: 16px;"><strong>${mentionedBy}</strong> mentioned you in a post.</p>
    
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 30px; border-radius: 12px; margin: 35px 0; text-align: center;">
      <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; display: inline-block;">
        <span style="font-size: 48px;">💬</span>
      </div>
      <p style="margin: 20px 0 0 0; color: #11998e; font-size: 18px; font-weight: 600;">Check your notifications to see what they said!</p>
    </div>
    
    <div style="background: linear-gradient(90deg, #e3f2fd 0%, #f3e5f5 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>💡 Quick tip:</strong> Reply to keep the conversation going and engage with your community!
      </p>
    </div>
    
    <p style="color: #777; font-size: 14px; text-align: center; margin: 20px 0;">Don't want to receive mention notifications? You can adjust your notification preferences in your account settings.</p>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #667eea;">Stay connected,</strong><br>
        <span style="color: #764ba2; font-weight: 500;">The Notifications Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated notification - please do not reply to this email
    </p>
    <div style="margin-top: 15px;">
      <span style="color: #ccc; font-size: 12px;">Secured by SSL encryption</span>
    </div>
  </div>
</body>
</html>
`;
};

// two-factor-auth.template.ts
export const ENABLE_2FA_VERIFICATION = (otp: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enable Two-Factor Authentication</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(252, 92, 125, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">🔐</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Enable Two-Factor Authentication</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Secure Your Account! 🛡️</p>
    <p style="color: #666; font-size: 16px;">You've requested to enable two-factor authentication on your account. This adds an extra layer of security to protect your data.</p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 35px 0; padding: 25px; border-radius: 12px; text-align: center; position: relative;">
      <p style="color: white; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Verification Code</p>
      <div style="background: rgba(255,255,255,0.95); padding: 15px 25px; border-radius: 8px; margin: 0 auto; display: inline-block;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">${otp}</span>
      </div>
    </div>
    
    <div style="background: linear-gradient(90deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #4caf50; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">
        <strong>✅ What happens next:</strong>
      </p>
      <ul style="margin: 5px 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li>Enter this code to confirm activation</li>
        <li>You'll need to verify your identity on each login</li>
        <li>Your account will be more secure</li>
      </ul>
    </div>
    
    <div style="background: linear-gradient(90deg, #fff3e0 0%, #ffe0b2 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #ff9800; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>⚠️ Important:</strong> This code will expire in 15 minutes. If you didn't request this, please ignore this email and your account will remain unchanged.
      </p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #fc5c7d;">Stay secure,</strong><br>
        <span style="color: #6a82fb; font-weight: 500;">The Security Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated message - please do not reply to this email
    </p>
    <div style="margin-top: 15px;">
      <span style="color: #ccc; font-size: 12px;">Secured by SSL encryption</span>
    </div>
  </div>
</body>
</html>
`;
};

export const TWO_FA_ENABLED_CONFIRMATION = (): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Two-Factor Authentication Enabled</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">✅</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">2FA Successfully Enabled</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Great job! 🎉</p>
    <p style="color: #666; font-size: 16px;">Two-factor authentication has been successfully enabled on your account.</p>
    
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
      <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; display: inline-block;">
        <span style="font-size: 48px;">🛡️</span>
      </div>
      <p style="margin: 20px 0 0 0; color: #11998e; font-size: 18px; font-weight: 600;">Your account is now more secure!</p>
    </div>
    
    <div style="background: linear-gradient(90deg, #e3f2fd 0%, #e1f5fe 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #03a9f4; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">
        <strong>📱 From now on:</strong>
      </p>
      <ul style="margin: 5px 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li>You'll receive a verification code each time you log in</li>
        <li>Only you can access your account</li>
        <li>Your data is protected with an extra security layer</li>
      </ul>
    </div>
    
    <div style="background: linear-gradient(90deg, #fff3e0 0%, #ffe0b2 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #ff9800; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>💡 Pro tip:</strong> You can disable 2FA anytime from your security settings.
      </p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #11998e;">Stay protected,</strong><br>
        <span style="color: #38ef7d; font-weight: 500;">The Security Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated message - please do not reply to this email
    </p>
    <div style="margin-top: 15px;">
      <span style="color: #ccc; font-size: 12px;">Secured by SSL encryption</span>
    </div>
  </div>
</body>
</html>
`;
};

export const LOGIN_2FA_VERIFICATION = (otp: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Verification Code</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">🔑</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Login Verification</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-top: 0; color: #555;">Welcome back! 👋</p>
    <p style="color: #666; font-size: 16px;">Someone just tried to log into your account. To complete your login, please use the verification code below:</p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 35px 0; padding: 25px; border-radius: 12px; text-align: center; position: relative;">
      <p style="color: white; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Login Code</p>
      <div style="background: rgba(255,255,255,0.95); padding: 15px 25px; border-radius: 8px; margin: 0 auto; display: inline-block;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">${otp}</span>
      </div>
    </div>
    
    <div style="background: linear-gradient(90deg, #e3f2fd 0%, #e1f5fe 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #03a9f4; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>⏱️ Quick action required:</strong> This code will expire in 10 minutes for your security.
      </p>
    </div>
    
    <div style="background: linear-gradient(90deg, #ffebee 0%, #ffcdd2 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #f44336; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">
        <strong>⚠️ Didn't try to log in?</strong>
      </p>
      <p style="margin: 0; color: #555; font-size: 14px;">
        If this wasn't you, your account may be at risk. Please:
      </p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li>Do NOT share this code with anyone</li>
        <li>Change your password immediately</li>
        <li>Contact our support team</li>
      </ul>
    </div>
    
    <div style="background: linear-gradient(90deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #4caf50; margin: 25px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>💡 Security tip:</strong> Never share your verification codes via email, text, or phone. We will never ask for your code.
      </p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #555;">
        <strong style="color: #667eea;">Stay secure,</strong><br>
        <span style="color: #764ba2; font-weight: 500;">The Security Team</span>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 25px; padding: 20px;">
    <p style="color: #999; font-size: 13px; margin: 0;">
      🤖 This is an automated message - please do not reply to this email
    </p>
    <div style="margin-top: 15px;">
      <span style="color: #ccc; font-size: 12px;">Secured by SSL encryption</span>
    </div>
  </div>
</body>
</html>
`;
};
