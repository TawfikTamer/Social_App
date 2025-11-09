import z from "zod";
import { genderEnum, friendShipStatusEnum } from "../../../Common";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/;

export const renewSignedUrlValidator = {
  body: z.strictObject({
    key: z.string().min(1),
    key_type: z.enum(["profilePicture", "coverPicture"] as const),
  }),
};

export const sendFriendRequestValidator = {
  params: z.strictObject({ receiverId: objectId }),
};

export const listFriendRequestsValidator = {
  query: z.object({
    status: z.enum(friendShipStatusEnum).optional(),
  }),
};

export const responseToFriendRequestValidator = {
  params: z.strictObject({ senderId: objectId }),
  body: z.strictObject({ response: z.enum(friendShipStatusEnum) }),
};

export const cancelFriendRequestValidator = {
  params: z.strictObject({ receiverId: objectId }),
};

export const deleteRejectedRequestValidator = {
  params: z.strictObject({ receiverId: objectId }),
};

export const removeFriendValidator = {
  params: z.strictObject({ friendId: objectId }),
};

export const blockUserValidator = {
  params: z.strictObject({ blockedUserId: objectId }),
};

export const unBlockUserValidator = {
  params: z.strictObject({ blockedUserId: objectId }),
};

export const createGroupValidator = {
  body: z.strictObject({
    name: z.string().min(1),
    members: z.array(objectId).min(1),
  }),
};

export const listBlockedUsersValidator = {
  query: z.object({}).optional(),
};

export const updateProfileDataValidator = {
  body: z
    .strictObject({
      userName: z.string().min(3).max(50).optional(),
      gender: z.enum(genderEnum).optional(),
      isPublic: z.boolean().optional(),
      phoneNumber: z.string().min(11).max(11).optional(),
      DOB: z.string().optional(),
    })
    .partial()
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "At least one field must be provided to update",
    }),
};

export const updateEmailValidator = {
  body: z.strictObject({ newEmail: z.email() }),
};

export const confirmNewEmailValidator = {
  body: z.strictObject({ newEmail: z.email(), OTP: z.string() }),
};

export const updatePasswordValidator = {
  body: z
    .strictObject({
      oldPassword: z.string(),
      newPassword: z.string().regex(passwordRegex),
      confirmNewPassword: z.string(),
    })
    .superRefine((val, ctx) => {
      if (val.newPassword !== val.confirmNewPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "passwords do not Match",
          path: ["confirmNewPassword"],
        });
      }
    }),
};

export const viewProfileValidator = {
  params: z.strictObject({ userID: objectId }),
};
