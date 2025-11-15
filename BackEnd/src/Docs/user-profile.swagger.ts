/**
 * @swagger
 * /api/user/profile/uplaod-profile-pic:
 *   patch:
 *     tags:
 *       - User Profile
 *     summary: Upload profile picture
 *     description: Upload or update user profile picture
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profile-pic
 *             properties:
 *               profile-pic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
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
 *                       example: profile-pic uploaded successfully
 *                     data:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: https://s3.amazonaws.com/...
 *                         key_name:
 *                           type: string
 *                           example: folder/user-id/Profile-Pic/image.jpg
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/user/profile/uplaod-cover-pic:
 *   patch:
 *     tags:
 *       - User Profile
 *     summary: Upload cover picture
 *     description: Upload or update user cover picture
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cover-pic
 *             properties:
 *               cover-pic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cover picture uploaded successfully
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
 *                       example: cover-pic uploaded successfully
 *                     data:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         key_name:
 *                           type: string
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/profile/renew-url:
 *   patch:
 *     tags:
 *       - User Profile
 *     summary: Renew signed URL
 *     description: Generate new signed URL for profile or cover picture
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - key_type
 *             properties:
 *               key:
 *                 type: string
 *                 example: "folder/user-id/Profile-Pic/image.jpg"
 *                 description: S3 object key
 *               key_type:
 *                 type: string
 *                 enum: [profilePicture, coverPicture]
 *                 example: profilePicture
 *     responses:
 *       200:
 *         description: URL renewed successfully
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
 *                       example: url has been renewed
 *                     data:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         key:
 *                           type: string
 *       400:
 *         description: Invalid key
 */

/**
 * @swagger
 * /api/user/profile/update-profile:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Update profile data
 *     description: Update user profile information (at least one field required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: john_updated
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *               isPublic:
 *                 type: boolean
 *                 example: true
 *                 description: Whether profile is public or private
 *               phoneNumber:
 *                 type: string
 *                 minLength: 11
 *                 maxLength: 11
 *                 example: "01234567890"
 *               DOB:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: No fields provided to update
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/profile/change-email:
 *   post:
 *     tags:
 *       - User Profile
 *     summary: Initiate email change
 *     description: Request email change with OTP verification sent to new email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: OTP sent to new email
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
 *                       example: please check your new email
 *       400:
 *         description: Same as current email or validation error
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /api/user/profile/confrim-changing-email:
 *   patch:
 *     tags:
 *       - User Profile
 *     summary: Confirm email change
 *     description: Verify OTP and complete email change (requires re-login after)
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *               - OTP
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *               OTP:
 *                 type: string
 *                 example: "123456"
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Email updated successfully - tokens invalidated, login required
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
 *                       example: email has been updated, Now you need to log in again with the new one
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /api/user/profile/update-password:
 *   patch:
 *     tags:
 *       - User Profile
 *     summary: Update password
 *     description: Change account password with current password verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$'
 *                 example: NewPassword123!
 *                 description: Must contain uppercase, lowercase, number, and special character
 *               confirmNewPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                       example: password has been changed
 *       400:
 *         description: Passwords don't match, wrong old password, or trying to use same password
 */

/**
 * @swagger
 * /api/user/profile/profile-data:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get own profile data
 *     description: Retrieve current user's complete profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
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
 *                       example: here is your data
 *                     data:
 *                       type: object
 *                       properties:
 *                         userName:
 *                           type: string
 *                           example: john_doe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         phoneNumber:
 *                           type: string
 *                           example: "01234567890"
 *                         DOB:
 *                           type: string
 *                           example: "1990-01-01"
 *                         isPublic:
 *                           type: boolean
 *                           example: true
 *                         gender:
 *                           type: string
 *                           example: male
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/profile/view-profile/{userID}:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: View another user's profile
 *     description: Get public profile data of another user with friendship status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to view
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                       example: here is user profile
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             userName:
 *                               type: string
 *                             gender:
 *                               type: string
 *                             coverPicture:
 *                               type: string
 *                             profilePicture:
 *                               type: string
 *                         friendState:
 *                           type: string
 *                           enum: [accepted, rejected, pending, not friends]
 *                           example: accepted
 *       400:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/profile/deActivte:
 *   patch:
 *     tags:
 *       - User Profile
 *     summary: Deactivate account
 *     description: Temporarily deactivate user account (can be reactivated by logging in)
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
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
 *                       example: account now has been deactivated, login again to active it
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/profile/delete-user:
 *   delete:
 *     tags:
 *       - User Profile
 *     summary: Delete account permanently
 *     description: Permanently delete user account and all associated data (posts, comments, reactions, friendships, etc.)
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
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
 *                       example: account has been deleted
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/profile/send-friend-request/{receiverId}:
 *   post:
 *     tags:
 *       - Friends
 *     summary: Send friend request
 *     description: Send a friend request to another user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user to send request to
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Friend request sent successfully
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
 *                       example: request send successfully
 *       400:
 *         description: Cannot send request to yourself or invalid receiver
 *       401:
 *         description: Cannot send request (users are blocking each other)
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/user/profile/list-friends:
 *   get:
 *     tags:
 *       - Friends
 *     summary: List friend requests or friends
 *     description: Get list of friend requests, friends, or rejected requests based on status parameter
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [accepted, rejected, pending]
 *         description: Filter by friendship status (default is pending)
 *         example: accepted
 *     responses:
 *       200:
 *         description: Friend list retrieved successfully
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
 *                       example: here is the your friendship list
 *                     data:
 *                       type: object
 *                       properties:
 *                         list:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/FriendShip'
 *                         groups:
 *                           type: array
 *                           description: Groups user is member of
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               type:
 *                                 type: string
 *                                 example: group
 *                               members:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/profile/response-to-friendrequest/{senderId}:
 *   patch:
 *     tags:
 *       - Friends
 *     summary: Respond to friend request
 *     description: Accept or reject a pending friend request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user who sent the request
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Response recorded successfully
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
 *                       example: request has been accepted
 *       404:
 *         description: Request not found or not pending
 */

/**
 * @swagger
 * /api/user/profile/cancel-friendrequest/{receiverId}:
 *   delete:
 *     tags:
 *       - Friends
 *     summary: Cancel friend request
 *     description: Cancel a pending friend request that you sent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user you sent request to
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Request cancelled successfully
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
 *                       example: request has been canceled
 *       400:
 *         description: Request already processed or doesn't exist
 */

/**
 * @swagger
 * /api/user/profile/delete-rejected/{receiverId}:
 *   delete:
 *     tags:
 *       - Friends
 *     summary: Delete rejected request
 *     description: Remove a rejected friend request from your history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user who rejected your request
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Request deleted from history
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
 *                       example: request has been deleted
 *       404:
 *         description: Request not found or not rejected
 */

/**
 * @swagger
 * /api/user/profile/remove-friend/{friendId}:
 *   delete:
 *     tags:
 *       - Friends
 *     summary: Remove friend
 *     description: Remove an accepted friend connection (unfriend)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of friend to remove
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Friend removed successfully
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
 *                       example: friend has been removed
 *       404:
 *         description: Friendship not found or already removed
 */

/**
 * @swagger
 * /api/user/profile/create-group:
 *   post:
 *     tags:
 *       - Friends
 *     summary: Create chat group
 *     description: Create a group chat with friends (all members must be your friends)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - members
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Study Group"
 *                 description: Group name
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 description: Array of friend IDs to add to group
 *     responses:
 *       201:
 *         description: Group created successfully
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
 *                       example: 201
 *                     success:
 *                       type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: group created
 *                     data:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         type:
 *                           type: string
 *                           example: group
 *                         members:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Members are not friends or invalid members
 *       404:
 *         description: Some members not found
 */

/**
 * @swagger
 * /api/user/profile/block-user/{blockedUserId}:
 *   post:
 *     tags:
 *       - Block List
 *     summary: Block user
 *     description: Block a user and automatically remove any friend connection
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockedUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user to block
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User blocked successfully
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
 *                       example: user has been blocked
 *       404:
 *         description: User not found
 *       409:
 *         description: User already blocked you
 */

/**
 * @swagger
 * /api/user/profile/unblock-user/{blockedUserId}:
 *   delete:
 *     tags:
 *       - Block List
 *     summary: Unblock user
 *     description: Remove user from your block list
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockedUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user to unblock
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User unblocked successfully
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
 *                       example: user has been unblocked
 *       404:
 *         description: User not in block list
 */

/**
 * @swagger
 * /api/user/profile/list-block-users:
 *   get:
 *     tags:
 *       - Block List
 *     summary: List blocked users
 *     description: Get list of all users you have blocked
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Block list retrieved successfully
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
 *                       example: here is the block list
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439011
 *                           theBlockedUser:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               userName:
 *                                 type: string
 *                                 example: blocked_user
 *       401:
 *         description: Unauthorized
 */
