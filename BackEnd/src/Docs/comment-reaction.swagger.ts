/**
 * @swagger
 * /api/comment/add-comment/{postId}:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Add comment to post
 *     description: Create a new comment on a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Great post!"
 *               comment-attachment:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Post doesn't allow comments
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/comment/add-reply:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Reply to comment
 *     description: Add a reply to an existing comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Thanks for your comment!"
 *               reply-attachment:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Reply added successfully
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /api/comment/update-comment/{commentId}:
 *   patch:
 *     tags:
 *       - Comments
 *     summary: Update comment
 *     description: Edit comment content
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newContent
 *             properties:
 *               newContent:
 *                 type: string
 *                 example: "Updated comment text"
 *     responses:
 *       200:
 *         description: Comment updated
 *       401:
 *         description: Unauthorized - not comment owner
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /api/comment/delete-comment/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete comment
 *     description: Delete a comment or reply (owner or post owner can delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /api/comment/post-comments/{postId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments on post
 *     description: Retrieve all comments for a specific post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Comments retrieved
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
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/comment/get-comment/{commentId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get single comment
 *     description: Retrieve a specific comment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Comment retrieved
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /api/comment/comment-with-replies/{commentId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comment with all replies
 *     description: Retrieve a comment along with all its replies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Comment with replies retrieved
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /api/reaction/react:
 *   post:
 *     tags:
 *       - Reactions
 *     summary: Add or update reaction
 *     description: React to a post or comment (like, love, haha, wow, sad, angry)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Post ID (provide either postId or commentId)
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: commentId
 *         schema:
 *           type: string
 *         description: Comment ID (provide either postId or commentId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - react
 *             properties:
 *               react:
 *                 type: string
 *                 enum: [like, love, haha, wow, sad, angry]
 *                 example: like
 *     responses:
 *       201:
 *         description: Reaction added
 *       400:
 *         description: Bad request - invalid query parameters
 *       404:
 *         description: Post or comment not found
 */

/**
 * @swagger
 * /api/reaction/un-react/{reactionId}:
 *   delete:
 *     tags:
 *       - Reactions
 *     summary: Remove reaction
 *     description: Delete a reaction from post or comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reactionId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Post ID (provide either postId or commentId)
 *       - in: query
 *         name: commentId
 *         schema:
 *           type: string
 *         description: Comment ID (provide either postId or commentId)
 *     responses:
 *       200:
 *         description: Reaction removed
 *       404:
 *         description: Reaction not found
 */

/**
 * @swagger
 * /api/reaction/list-reactions:
 *   get:
 *     tags:
 *       - Reactions
 *     summary: List all reactions
 *     description: Get all reactions on a post or comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Post ID (provide either postId or commentId)
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: commentId
 *         schema:
 *           type: string
 *         description: Comment ID (provide either postId or commentId)
 *     responses:
 *       200:
 *         description: Reactions retrieved
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
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Reaction'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Post or comment not found
 */
