import { Request, Response } from "express";
import { IUser } from "../../../Common";
import { UserOTPsRepository, UserRepository } from "../../../DB/Repositories/index";
import { userModel, otpModel } from "../../../DB/models/index";
import { emitter, encrypt, VERIFICATION_EMAIL, WELCOME_EMAIL } from "../../../Utils";
import bcrypt from "bcrypt";
import { customAlphabet } from "nanoid";
import mongoose from "mongoose";

export class AuthService {
  userRep: UserRepository = new UserRepository(userModel);
  otpRep: UserOTPsRepository = new UserOTPsRepository(otpModel);

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/auth/signUp
   * @description Register a new user with hashed password and encrypted phone number
   */
  singUp = async (req: Request, res: Response) => {
    // get data  from body
    const { userName, email, password, gender, phoneNumber }: Partial<IUser> = req.body;

    // check if the email exist
    const isExist = await this.userRep.findOneDocument({ email });
    if (isExist) {
      return res.status(409).json({ msg: `User Already exist` });
    }

    // hash password
    const hasedPassword = await bcrypt.hash(password as string, parseInt(process.env.SALT_ROUNDS as string));

    // encrypt phoneNumber
    const encryptedPhoneNumber: string = encrypt(phoneNumber as string);

    // create OTP
    const nanoid = customAlphabet("1234567890", 6);
    const OTP: string = nanoid();

    // send email with the OTP
    emitter.emit("sendEmail", {
      to: email,
      subject: "Confirm Email",
      content: VERIFICATION_EMAIL(OTP),
    });

    // create new user
    const newUser: Partial<IUser> = await this.userRep.createNewDocument({ userName, email, password: hasedPassword, gender, phoneNumber: encryptedPhoneNumber });

    // hash the otp
    const hasedOTP = await bcrypt.hash(OTP, parseInt(process.env.SALT_ROUNDS as string));

    // send the otp to the DB
    await this.otpRep.createNewDocument({ userId: newUser._id as mongoose.Schema.Types.ObjectId, confirm: hasedOTP });

    return res.status(200).json({ msg: `Registered successfully, now please confirm your email`, userData: newUser });
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/auth/confirm
   * @description Confirm user email with OTP
   */
  confirmEmail = async (req: Request, res: Response) => {
    const { OTP, email } = req.body;

    // get the user ID from email
    const user = await this.userRep.findOneDocument({ email });
    if (!user) {
      return res.status(400).json({ msg: `no user found with this email` });
    }

    // find the otp of this user
    const userOTP = await this.otpRep.findOneDocument({ userId: user._id });
    if (!userOTP) {
      return res.status(400).json({ msg: `didn't find any OTPS for this user` });
    }

    // check if the otp is correct
    const correctOTP: string = userOTP.confirm as string;
    const isCorrect = await bcrypt.compare(OTP, correctOTP);
    if (!isCorrect) {
      return res.status(400).json({ msg: `wrong OTP` });
    }

    // update the user and make it verified
    await this.userRep.upadeOneDocument({ email }, { isVerified: true });

    // delete the otp from DB
    await this.otpRep.deleteOneDocument({ userId: user._id });

    // send welcome email
    emitter.emit("sendEmail", {
      to: email,
      subject: "Welcome Email",
      content: WELCOME_EMAIL(user.userName),
    });

    return res.status(200).json({ msg: `email has been confirmed, Now you can login` });
  };
}

export default new AuthService();
