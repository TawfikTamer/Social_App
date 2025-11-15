/**
 * @swagger
 * /api/post/add-post:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Create a new post
 *     description: Create a post with optional attachments and friend tags
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Check out my vacation photos!"
 *               allowComments:
 *                 type: boolean
 *                 example: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *               post-attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 20
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/post/update-post/{postId}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Update a post
 *     description: Update post description, comment settings, or tags
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Updated post description"
 *               allowComments:
 *                 type: boolean
 *                 example: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/post/delete-post/{postId}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Delete a post
 *     description: Delete a post and all associated content (comments, reactions, attachments)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized - not post owner
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/post/post-visibility/{postId}:
 *   patch:
 *     tags:
 *       - Posts
 *     summary: Change post visibility
 *     description: Update post visibility settings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visibility
 *             properties:
 *               visibility:
 *                 type: string
 *                 enum: [public, friends, only me]
 *                 example: friends
 *     responses:
 *       200:
 *         description: Post visibility changed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/post/list-posts:
 *   get:
 *     tags:
 *       - Posts
 *     summary: List posts
 *     description: Get paginated list of posts based on filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of posts per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Get posts from specific user
 *       - in: query
 *         name: home
 *         schema:
 *           type: string
 *         description: Get home feed posts
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
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
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/post/get-post/{postId}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get single post
 *     description: Retrieve a specific post by ID with visibility checks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Post retrieved successfully
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
 *                       $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized - private or friends-only post
 *       404:
 *         description: Post not found
 */
