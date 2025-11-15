/**
 * @swagger
 * /api/user/auth/SignUp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *               - confirmPassword
 *               - gender
 *               - DOB
 *               - phoneNumber
 *             properties:
 *               userName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 10
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$'
 *                 description: Must contain uppercase, lowercase, number, and special character
 *                 example: Password123!
 *               confirmPassword:
 *                 type: string
 *                 example: Password123!
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *               DOB:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               phoneNumber:
 *                 type: string
 *                 minLength: 11
 *                 maxLength: 11
 *                 example: 01234567890
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/user/auth/Confirm:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Confirm email with OTP
 *     description: Verify user email using OTP sent during registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - OTP
 *               - email
 *             properties:
 *               OTP:
 *                 type: string
 *                 example: "123456"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/user/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with email and password
 *     description: Authenticate user and receive access and refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     statusCode:
 *                       type: number
 *                       example: 200
 *                     success:
 *                       type: boolean
 *                       example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: logged In successfully
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/user/auth/auth-gmail:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate with Google
 *     description: Login or register using Google OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Invalid token
 */

/**
 * @swagger
 * /api/user/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Revoke access and refresh tokens
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/auth/forget-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: Send OTP to email for password recovery
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Recovery email sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/user/auth/reset-password:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Reset password with OTP
 *     description: Change password using OTP received via email
 *     security:
 *       - recoveryToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *               confirmNewPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /api/user/auth/refresh-token:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     security:
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     statusCode:
 *                       type: number
 *                     success:
 *                       type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *       401:
 *         description: Invalid refresh token
 */

/**
 * @swagger
 * /api/user/auth/2FA-enable:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Enable two-factor authentication
 *     description: Send OTP to enable 2FA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/auth/2FA-confirm-enable:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Confirm 2FA activation
 *     description: Verify OTP to enable two-factor authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - OTP
 *             properties:
 *               OTP:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid OTP
 */

/**
 * @swagger
 * /api/user/auth/2FA-disable:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Disable two-factor authentication
 *     description: Turn off 2FA for the account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: 2FA is not enabled
 */

/**
 * @swagger
 * /api/user/auth/login-with-2FA:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Complete login with 2FA
 *     description: Verify 2FA code to complete login process
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - OTP
 *             properties:
 *               OTP:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         description: Invalid OTP
 */
