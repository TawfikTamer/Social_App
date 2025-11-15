import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Social Media API",
    version: "1.0.0",
    description:
      "A comprehensive social media API with authentication, posts, comments, reactions, and real-time chat",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: "Development server",
    },
    {
      url: "https://api.production.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your access token",
      },
      refreshToken: {
        type: "apiKey",
        in: "header",
        name: "refreshtoken",
        description: "Enter your refresh token with Bearer prefix",
      },
      recoveryToken: {
        type: "apiKey",
        in: "header",
        name: "recoverytoken",
        description: "Enter your recovery token with Bearer prefix",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "507f1f77bcf86cd799439011" },
          userName: { type: "string", example: "john_doe" },
          email: { type: "string", example: "john@example.com" },
          gender: { type: "string", enum: ["male", "female"] },
          role: { type: "string", enum: ["user", "admin"] },
          isVerified: { type: "boolean" },
          isPublic: { type: "boolean" },
          DOB: { type: "string", format: "date" },
          profilePicture: { type: "string" },
          coverPicture: { type: "string" },
        },
      },
      Post: {
        type: "object",
        properties: {
          _id: { type: "string" },
          description: { type: "string" },
          attachments: { type: "array", items: { type: "string" } },
          ownerId: { type: "string" },
          allowComments: { type: "boolean" },
          tags: { type: "array", items: { type: "string" } },
          visibility: {
            type: "string",
            enum: ["public", "friends", "only me"],
          },
        },
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          content: { type: "string" },
          ownerId: { type: "string" },
          attachments: { type: "string" },
          refId: { type: "string" },
          onModel: { type: "string", enum: ["posts", "comments"] },
        },
      },
      Reaction: {
        type: "object",
        properties: {
          _id: { type: "string" },
          react: {
            type: "string",
            enum: ["like", "love", "haha", "wow", "sad", "angry"],
          },
          reactOwner: { type: "string" },
          reactOn: { type: "string" },
          refModel: { type: "string", enum: ["posts", "comments"] },
        },
      },
      FriendShip: {
        type: "object",
        properties: {
          _id: { type: "string" },
          senderId: { type: "string" },
          receiverId: { type: "string" },
          status: {
            type: "string",
            enum: ["accepted", "rejected", "pending"],
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          meta: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              success: { type: "boolean" },
            },
          },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              error: { type: "object" },
            },
          },
        },
      },
      Success: {
        type: "object",
        properties: {
          meta: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              success: { type: "boolean" },
            },
          },
          data: {
            type: "object",
            properties: {
              message: { type: "string" },
              data: { type: "object" },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Authentication", description: "User authentication endpoints" },
    { name: "User Profile", description: "User profile management" },
    { name: "Posts", description: "Post management endpoints" },
    { name: "Comments", description: "Comment management endpoints" },
    { name: "Reactions", description: "Reaction management endpoints" },
    { name: "Friends", description: "Friend management endpoints" },
    { name: "Block List", description: "User blocking endpoints" },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    "./src/Modules/**/*.controller.ts",
    "./src/Modules/**/*.ts",
    "./src/Docs/**/*.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);

// Export setup function for Express app
export const setupSwagger = (app: any) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Social Media API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
};
