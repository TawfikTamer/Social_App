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
