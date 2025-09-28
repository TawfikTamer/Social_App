import { Request, Response } from "express";
import { IRequest, IUser } from "../../../Common";
import { UserOTPsRepository, UserRepository } from "../../../DB/Repositories/index";
import { userModel, otpModel, blackListedTokensModel } from "../../../DB/models/index";
import {
  emitter,
  encrypt,
  VERIFICATION_EMAIL,
  WELCOME_EMAIL,
  hashingData,
  compareHashedData,
  generateToken,
} from "../../../Utils";
import { customAlphabet } from "nanoid";
import { Schema } from "mongoose";
import { Secret, SignOptions } from "jsonwebtoken";
import { v4 as uuidV4 } from "uuid";
import { BlackListedTokenRepository } from "../../../DB/Repositories/black-listed-tokens.repository";

export class AuthService {
  userRep: UserRepository = new UserRepository(userModel);
  otpRep: UserOTPsRepository = new UserOTPsRepository(otpModel);
  blackListedRep: BlackListedTokenRepository = new BlackListedTokenRepository(
    blackListedTokensModel
  );

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
    const isExist = await this.userRep.findOneDocument({
      email,
    });
    if (isExist) {
      return res.status(409).json({ msg: `User Already exist` });
    }

    // hash password
    const hasedPassword = await hashingData(
      password as string,
      parseInt(process.env.SALT_ROUNDS as string)
    );

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
    const newUser: Partial<IUser> = await this.userRep.createNewDocument({
      userName,
      email,
      password: hasedPassword,
      gender,
      phoneNumber: encryptedPhoneNumber,
    });

    // hash the otp
    const hasedOTP = await hashingData(OTP, parseInt(process.env.SALT_ROUNDS as string));

    // send the otp to the DB
    await this.otpRep.createNewDocument({
      userId: newUser._id as Schema.Types.ObjectId,
      confirm: hasedOTP,
    });

    return res.status(200).json({
      msg: `Registered successfully, now please confirm your email`,
      userData: newUser,
    });
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
      return res.status(400).json({
        msg: `didn't find any OTPS for this user`,
      });
    }

    // check if the otp is correct
    const correctOTP: string = userOTP.confirm as string;
    const isCorrect = await compareHashedData(OTP, correctOTP);
    if (!isCorrect) {
      return res.status(400).json({ msg: `wrong OTP` });
    }

    // update the user and make it verified
    await this.userRep.upadeOneDocument({ email }, { isVerified: true });

    // delete the otp from DB
    await this.otpRep.deleteOneDocument({
      userId: user._id,
    });

    // send welcome email
    emitter.emit("sendEmail", {
      to: email,
      subject: "Welcome Email",
      content: WELCOME_EMAIL(user.userName),
    });

    return res.status(200).json({
      msg: `email has been confirmed, Now you can login`,
    });
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/auth/login
   * @description Login user with email and password
   */
  logIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // check if the email exist and verified
    const user = await this.userRep.findOneDocument({
      email,
    });
    if (!user || !user?.isVerified) {
      return res.status(409).json({ msg: `invalid email/password` });
    }

    // check if the pasword is correct
    const isPasswordCorrect = await compareHashedData(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(409).json({ msg: `invalid email/password` });
    }

    // generate token
    const accessTokenID = uuidV4();
    const accessToken = generateToken(
      {
        _id: user._id,
        email,
      },
      process.env.JWT_ACCESS_KEY as Secret,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: accessTokenID,
      }
    );

    res.status(200).json({ msg: `logged In successfully`, accessToken });
  };

  logOut = async (req: Request, res: Response) => {
    const { token } = (req as IRequest).loggedInUser;

    // revoke the token
    await this.blackListedRep.createNewDocument({
      accsessTokenId: token.jti,
      expirationDate: new Date((token.exp as number) * 1000),
    });

    res.status(200).json({ msg: `logged Out successfully` });
  };
}

export default new AuthService();
