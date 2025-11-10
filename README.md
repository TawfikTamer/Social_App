# Social App - Backend API

A social networking backend built with **Express.js**, **MongoDB**, **Socket.IO**, and **TypeScript**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables (create .env file)

# Run in development mode
npm run dev
```

Server runs at `http://localhost:5000`

---

## 📦 Setup

### Prerequisites

- Node.js ≥ 14.0
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repo-url>
cd "Social app Project/Social App"
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file in root:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_ACCESS_KEY=your-secret-key-min-32-chars
JWT_REFRESH_KEY=your-refresh-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ENCRYPTION_KEY=32-character-key-here
ENCRYPTION_IV=16-character-iv

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=bucket-name

WHITELIST=http://localhost:3000,http://localhost:3001
WEB_CLIENT_ID=your-google-client-id
SALT_ROUNDS=10
OTPS_EXPIRES_IN_MIN=10
```

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Auto-restarts on file changes using Nodemon.

### Production Mode

```bash
npm start
```

---

## 📁 Project Structure

```
src/
├── index.ts                    # Main app entry point
├── Common/                     # Enums & Interfaces
│   ├── Enums/
│   └── Interfaces/
├── DB/                         # Database layer
│   ├── db.connection.ts
│   ├── models/                 # Mongoose schemas
│   └── Repositories/           # Data access layer
├── Modules/                    # Feature modules
│   ├── Users/                  # Auth & Profile
│   ├── Posts/                  # Posts CRUD
│   ├── Comments/               # Comments & Replies
│   ├── Reactions/              # Likes & Reactions
│   └── Chats/                  # Real-time messaging
├── Middlewares/                # Auth, Validation, etc.
├── Gatewayes/                  # Socket.IO setup
└── Utils/                      # Helpers & Services
    ├── Encryptions/            # JWT, Bcrypt, AES
    ├── Errors/                 # Exception classes
    ├── Services/               # Email, S3, etc.
    └── Validators/             # Zod schemas
```

---

## 🔐 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Response Format

```json
{
  "success": true,
  "message": "Operation completed",
  "statusCode": 200,
  "data": {}
}
```

### Authentication Endpoints

**POST /user/sign-up**

- Register new user
- Request body: `{ userName, email, password, confirmPassword, gender, phoneNumber, DOB }`

**POST /user/login**

- Login with email/password
- Response: `{ accessToken, refreshToken }`

**POST /user/auth-gmail**

- Google OAuth login
- Request body: `{ idToken }`

**POST /user/logout**

- Revoke tokens
- Headers: `accesstoken`, `refreshtoken`

**POST /user/refresh-token**

- Get new access token
- Headers: `refreshtoken`

---

### User Profile Endpoints

**PATCH /profile/upload-profile-pic**

- Upload profile picture
- Request: `multipart/form-data` with file

**PATCH /profile/upload-cover-pic**

- Upload cover photo

**PUT /profile/update-profile**

- Update user info
- Request body: `{ userName, gender, isPublic, phoneNumber, DOB }`

**PATCH /profile/update-password**

- Change password

**GET /profile/profile-data**

- Get current user profile

**GET /profile/view-profile/:userID**

- View another user's profile

---

### Friend Endpoints

**POST /profile/send-friend-request/:receiverId**

- Send friend request

**GET /profile/list-friends?status=PENDING**

- List friends or pending requests
- Query: `status` = PENDING, ACCEPTED, REJECTED

**PATCH /profile/response-to-friendrequest/:senderId**

- Accept or reject request
- Request body: `{ response: "ACCEPTED" }`

**DELETE /profile/remove-friend/:friendId**

- Remove friend

**POST /profile/block-user/:blockedUserId**

- Block user

**DELETE /profile/unblock-user/:blockedUserId**

- Unblock user

---

### Post Endpoints

**POST /post/add-post**

- Create post
- Request: `multipart/form-data` with description, files, tags

**PUT /post/update-post/:postId**

- Update post

**DELETE /post/delete-post/:postId**

- Delete post

**PATCH /post/post-visibility/:postId**

- Change visibility (PUBLIC, FRIENDS, ONLY_ME)

**GET /post/list-posts?page=1&limit=10**

- List posts with pagination

**GET /post/get-post/:postId**

- Get single post

---

### Comment Endpoints

**POST /comment/add-comment/:postId**

- Add comment to post
- Request: `multipart/form-data` with content, file

**POST /comment/add-reply?commentId=:commentId**

- Reply to comment

**PATCH /comment/update-comment/:commentId**

- Update comment

**DELETE /comment/delete-comment/:commentId**

- Delete comment/reply

**GET /comment/post-comments/:postId**

- Get all comments on post

**GET /comment/comment-with-replies/:commentId**

- Get comment with replies

---

### Reaction Endpoints

**POST /reaction/react?postId=:postId**

- Add reaction to post/comment
- Request body: `{ react: "😍" }`

**DELETE /reaction/unreact/:reactionId?postId=:postId**

- Remove reaction

**GET /reaction/list?postId=:postId**

- Get all reactions on post/comment

---

## 💬 Real-time Chat (Socket.IO)

### Connection

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "access_token" },
});
```

### Private Messaging

```javascript
// Join chat
socket.emit("join-private-chat", { targetUserId: "userId" });

// Send message
socket.emit("private-message", { text: "Hello!", targetUserId: "userId" });

// Listen for messages
socket.on("message-sent", (message) => {});
socket.on("chat-history", (messages) => {});
socket.on("isTyping", (data) => {});
```

### Group Messaging

```javascript
// Join group
socket.emit("join-group", { groupId: "groupId" });

// Send group message
socket.emit("group-message", { text: "Hello!", targetGroupId: "groupId" });

// Listen
socket.on("group-chat-history", (messages) => {});
```

---

## 🗄️ Database Models

### User

- userName, email, password (hashed)
- gender, phoneNumber, DOB
- profilePicture, coverPicture (S3 keys)
- isPublic, isVerified, isDeactivated
- twoStepVerification, provider (LOCAL/GOOGLE)

### Post

- description, attachments (S3 keys)
- ownerId (User), tags (User references)
- visibility (PUBLIC/FRIENDS/ONLY_ME)
- allowComments

### Comment

- content, attachments
- ownerId, onModel (POST/COMMENT), refId
- replies via recursive structure

### Reaction

- react (emoji), reactOwner (User)
- reactOn (Post/Comment ID), refModel

### Friendship

- senderId, receiverId (User references)
- status (PENDING/ACCEPTED/REJECTED)

### Conversion (Chat)

- type (DIRECT/GROUP)
- members (User references)
- name (for groups)

### Message

- text, senderId (User)
- ConversionId (Chat reference)

---

## 🔒 Security

- JWT authentication with access/refresh tokens
- Bcrypt password hashing (10 rounds)
- AES-256 encryption for sensitive data
- AWS S3 signed URLs for file access
- CORS whitelist validation
- Email verification via OTP
- Two-factor authentication (2FA)
- Token blacklist for logout

---

## ⚠️ Error Handling

| Status | Exception                    | Usage                      |
| ------ | ---------------------------- | -------------------------- |
| 400    | BadRequestException          | Invalid input              |
| 401    | UnauthorizedException        | Auth failed, access denied |
| 404    | NotFoundException            | Resource not found         |
| 409    | ConflictException            | Duplicate email, conflict  |
| 500    | InternalServerErrorException | Server error               |

---

## 🛠 Tech Stack

- **Express.js v5.1.0** - Web framework
- **MongoDB + Mongoose v8.19.3** - Database
- **Socket.IO v4.8.1** - Real-time communication
- **TypeScript** - Type safety
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **AWS S3** - File storage
- **Nodemailer** - Email service
- **Zod** - Validation
- **Multer** - File uploads

---

**Last Updated:** November 10, 2025
