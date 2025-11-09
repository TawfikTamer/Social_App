import { Request, Response } from "express";
import { genderEnum, IRequest, IUser, providerEnum } from "../../../Common";
import {
  UserOTPsRepository,
  UserRepository,
} from "../../../DB/Repositories/index";
import {
  userModel,
  otpModel,
  blackListedTokensModel,
} from "../../../DB/models/index";
import {
  emitter,
  encrypt,
  VERIFICATION_EMAIL,
  WELCOME_EMAIL,
  hashingData,
  compareHashedData,
  generateToken,
  SuccessResponse,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  PASSWORD_RESET_REQUEST,
  PASSWORD_CHANGED,
  ENABLE_2FA_VERIFICATION,
  TWO_FA_ENABLED_CONFIRMATION,
  LOGIN_2FA_VERIFICATION,
} from "../../../Utils";
import { customAlphabet } from "nanoid";
import { Types } from "mongoose";
import { Secret, SignOptions } from "jsonwebtoken";
import { v4 as uuidV4 } from "uuid";
import { BlackListedTokenRepository } from "../../../DB/Repositories/black-listed-tokens.repository";
import { OAuth2Client, TokenPayload } from "google-auth-library";

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
    const {
      userName,
      email,
      password,
      confirmPassword,
      gender,
      phoneNumber,
      DOB,
    } = req.body;

    // check if password and confirmPassword match
    if (password !== confirmPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    // check if the email exist
    const isExist = await this.userRep.findOneDocument({
      email,
    });
    if (isExist) {
      if (isExist.provider?.includes(providerEnum.LOCAL))
        throw new ConflictException("User Already exist", { email });
    }

    // hash password
    const hasedPassword = await hashingData(
      password as string,
      parseInt(process.env.SALT_ROUNDS as string)
    );

    // encrypt phoneNumber
    const encryptedPhoneNumber: string = encrypt(phoneNumber as string);

    // if the user signed up with google before, just update the data
    if (isExist) {
      isExist.password = hasedPassword;
      isExist.gender = gender as genderEnum;
      isExist.phoneNumber = encryptedPhoneNumber;
      isExist.provider?.push(providerEnum.LOCAL);
      isExist.needToCompleteData = false;
      isExist.save();
      return res
        .status(201)
        .json(
          SuccessResponse<object>(
            "Registered successfully, now you can login with email/password or gmail",
            200,
            { userData: isExist }
          )
        );
    }

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
      DOB,
      phoneNumber: encryptedPhoneNumber,
      provider: [providerEnum.LOCAL],
      needToCompleteData: false,
    });

    // hash the otp
    const hasedOTP = await hashingData(
      OTP,
      parseInt(process.env.SALT_ROUNDS as string)
    );

    // send the otp to the DB
    await this.otpRep.FindAndUpdateOrCreate(
      {
        userId: newUser._id as Types.ObjectId,
      },
      {
        userId: newUser._id as Types.ObjectId,
        confirm: hasedOTP,
        expiration: new Date(
          Date.now() + parseInt(process.env.OTPS_EXPIRES_IN_MIN!) * 60 * 1000
        ),
      }
    );

    return res
      .status(201)
      .json(
        SuccessResponse<object>(
          "Registered successfully, now please confirm your email",
          200,
          { userData: newUser }
        )
      );
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
      throw new NotFoundException("no user found with this email", {
        email,
      });
    }

    // find the otp of this user
    const userOTP = await this.otpRep.findOneDocument({ userId: user._id });
    if (!userOTP || userOTP.expiration < new Date()) {
      throw new BadRequestException("otp Expired, try to register again");
    }

    // check if the otp is correct
    const correctOTP: string = userOTP.confirm as string;
    const isCorrect = await compareHashedData(OTP, correctOTP);
    if (!isCorrect) {
      throw new BadRequestException("wrong OTP");
    }

    // update the user and make it verified
    await this.userRep.updateOneDocument({ email }, { isVerified: true });

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

    return res
      .status(200)
      .json(
        SuccessResponse("email has been confirmed, Now you can login", 200)
      );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/auth/auth-gmail
   * @description Authenticate user via Google OAuth and create/update user profile
   */
  gmailAuth = async (req: Request, res: Response) => {
    // get the idToken from the body
    const { idToken } = req.body;

    // verfiy the token using google-auth-library
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,
    });

    const { sub, name, email, email_verified } =
      ticket.getPayload() as TokenPayload;

    // check if this email is not verified from google
    if (!email_verified) {
      throw new UnauthorizedException("this email is not verified");
    }

    let user: IUser | null = await this.userRep.findOneDocument({
      googleId: sub,
    });

    if (!user) {
      // check if this user signed local
      user = await this.userRep.findOneDocument({ email });
      if (user) {
        user.provider?.push(providerEnum.GOOGLE);
        user.googleId = sub;
        user.isVerified = true;
        user.save();
        // delete any otp
        await this.otpRep.deleteOneDocument({ userId: user._id });
      } else {
        // create a new user
        user = await this.userRep.createNewDocument({
          userName: name,
          email,
          isVerified: true,
          googleId: sub,
          provider: [providerEnum.GOOGLE],
          needToCompleteData: true,
        });
      }
    }

    // generate token
    const accessTokenID = uuidV4();
    const refreshTokenId = uuidV4();

    // accessToken
    const accessToken = generateToken(
      {
        _id: user._id,
        email,
        refreshTokenId,
      },
      process.env.JWT_ACCESS_KEY as Secret,
      {
        expiresIn: process.env
          .JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: accessTokenID,
      }
    );

    // refreshtoken
    const refreshToken = generateToken(
      {
        _id: user._id,
        email,
      },
      process.env.JWT_REFRESH_KEY as Secret,
      {
        expiresIn: process.env
          .JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: refreshTokenId,
      }
    );

    return res.status(200).json(
      SuccessResponse<object>("logged In successfully", 200, {
        accessToken,
        refreshToken,
      })
    );
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
    const user = await this.userRep.findOneDocument(
      {
        email,
      },
      {},
      {
        includeDeactivated: true,
      }
    );
    if (!user || !user?.isVerified) {
      throw new UnauthorizedException("invalid email/password");
    }

    // check if the pasword is correct
    const isPasswordCorrect = await compareHashedData(
      password,
      user.password as string
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException("invalid email/password");
    }

    // check if 2fa is enabled
    if (user.twoStepVerification) {
      // send otp to login

      const nanoid = customAlphabet("1234567890", 6);
      const OTP: string = nanoid();
      const hasedOTP = await hashingData(
        OTP,
        parseInt(process.env.SALT_ROUNDS as string)
      );
      // send email with the OTP
      emitter.emit("sendEmail", {
        to: user.email,
        subject: "Confirm 2 step verification",
        content: LOGIN_2FA_VERIFICATION(OTP),
      });

      // send the otp to the DB
      await this.otpRep.FindAndUpdateOrCreate(
        {
          userId: user._id as Types.ObjectId,
        },
        {
          userId: user._id as Types.ObjectId,
          confirm: hasedOTP,
          expiration: new Date(
            Date.now() + parseInt(process.env.OTPS_EXPIRES_IN_MIN!) * 60 * 1000
          ),
        }
      );

      // generate token
      const accessTokenID = uuidV4();
      const refreshTokenId = uuidV4();

      // accessToken
      const accessToken = generateToken(
        {
          _id: user._id,
          email,
          refreshTokenId,
          userName: user.userName,
        },
        process.env.JWT_ACCESS_KEY as Secret,
        {
          expiresIn: "15 Minutes",
          jwtid: accessTokenID,
        }
      );

      return res
        .status(200)
        .json(SuccessResponse("sending OTP to login", 200, { accessToken }));
    }

    // generate token
    const accessTokenID = uuidV4();
    const refreshTokenId = uuidV4();

    // accessToken
    const accessToken = generateToken(
      {
        _id: user._id,
        email,
        refreshTokenId,
        userName: user.userName,
      },
      process.env.JWT_ACCESS_KEY as Secret,
      {
        expiresIn: process.env
          .JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: accessTokenID,
      }
    );

    // refreshtoken
    const refreshToken = generateToken(
      {
        _id: user._id,
        email,
        userName: user.userName,
      },
      process.env.JWT_REFRESH_KEY as Secret,
      {
        expiresIn: process.env
          .JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: refreshTokenId,
      }
    );

    // reactivate the account in case it's deactivated
    if (user.isDeactivated) {
      user.isDeactivated = false;
      user.save();
    }

    return res.status(200).json(
      SuccessResponse<object>("logged In successfully", 200, {
        accessToken,
        refreshToken,
      })
    );
  };

  logInWith2FA = async (req: Request, res: Response) => {
    //get loggedIn user
    const { userData } = (req as IRequest).loggedInUser as { userData: IUser };
    const { OTP } = req.body;

    // find the otp of this user
    const userOTP = await this.otpRep.findOneDocument({ userId: userData._id });
    if (!userOTP || userOTP.expiration < new Date()) {
      throw new BadRequestException("otp Expired, try to register again");
    }

    // check if the otp is correct
    const correctOTP: string = userOTP.confirm as string;
    const isCorrect = await compareHashedData(OTP, correctOTP);
    if (!isCorrect) {
      throw new BadRequestException("wrong OTP");
    }

    // generate token
    const accessTokenID = uuidV4();
    const refreshTokenId = uuidV4();

    // accessToken
    const accessToken = generateToken(
      {
        _id: userData._id,
        email: userData.email,
        refreshTokenId,
        userName: userData.userName,
      },
      process.env.JWT_ACCESS_KEY as Secret,
      {
        expiresIn: process.env
          .JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: accessTokenID,
      }
    );

    // refreshtoken
    const refreshToken = generateToken(
      {
        _id: userData._id,
        email: userData.email,
        userName: userData.userName,
      },
      process.env.JWT_REFRESH_KEY as Secret,
      {
        expiresIn: process.env
          .JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: refreshTokenId,
      }
    );

    // reactivate the account in case it's deactivated
    if (userData.isDeactivated) {
      userData.isDeactivated = false;
      userData.save();
    }

    // delete the otp from DB
    await this.otpRep.deleteOneDocument({
      userId: userData._id,
    });

    return res.status(200).json(
      SuccessResponse<object>("logged In successfully", 200, {
        accessToken,
        refreshToken,
      })
    );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/auth/logout
   * @description Logout the user
   */
  logOut = async (req: Request, res: Response) => {
    const { accessTokenData, refreshTokenData } = (req as IRequest)
      .loggedInUser;

    // revoke the token
    await this.blackListedRep.createNewDocument({
      accsessTokenId: accessTokenData?.jti,
      refreshTokenId: refreshTokenData?.jti,
      expirationDate: new Date((accessTokenData?.exp as number) * 1000),
    });

    return res
      .status(200)
      .json(SuccessResponse("logged Out successfully", 200));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/auth/refresh-token
   * @description Refresh access token using refresh token
   */
  refreshToken = async (req: Request, res: Response) => {
    const { refreshTokenData } = (req as IRequest).loggedInUser;

    // generate new access token
    const accessToken = generateToken(
      {
        _id: refreshTokenData?._id,
        email: refreshTokenData?.email,
        refreshTokenId: refreshTokenData?.jti,
      },
      process.env.JWT_ACCESS_KEY as Secret,
      {
        expiresIn: process.env
          .JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: uuidV4(),
      }
    );

    return res
      .status(200)
      .json(SuccessResponse("token has been refreshed", 200, { accessToken }));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/auth/forget-Password
   * @description Send password recovery OTP to user email
   */
  forgetPassword = async (req: Request, res: Response) => {
    // get the email
    const { email } = req.body;

    //check for the email in db
    const user = await this.userRep.findOneDocument({ email });
    if (!user) {
      throw new NotFoundException("no user with this data");
    }

    // create recovery token
    const recoveryToken = generateToken(
      {
        _id: user._id,
        email,
      },
      process.env.JWT_ACCESS_KEY as Secret,
      {
        expiresIn: process.env
          .JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
        jwtid: uuidV4(),
      }
    );

    // create OTP
    const nanoid = customAlphabet("1234567890", 6);
    const recoveryOTP: string = nanoid();

    // send email with the otp
    emitter.emit("sendEmail", {
      to: email,
      subject: `password recover`,
      content: PASSWORD_RESET_REQUEST(recoveryOTP),
    });

    // hash the otp
    const hasedOTP = await hashingData(
      recoveryOTP,
      parseInt(process.env.SALT_ROUNDS as string)
    );

    // send the otp to the DB
    await this.otpRep.FindAndUpdateOrCreate(
      { userId: user._id as Types.ObjectId },
      {
        recovery: hasedOTP,
        expiration: new Date(
          Date.now() + parseInt(process.env.OTPS_EXPIRES_IN_MIN!) * 60 * 1000
        ),
      }
    );

    return res.status(200).json(
      SuccessResponse<object>("please check your email", 200, {
        recoveryToken,
      })
    );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/auth/Reset-Password
   * @description Reset user password using OTP
   */
  resetPassword = async (req: Request, res: Response) => {
    // get the otp , new password
    const { otp, newPassword, confirmNewPassword } = req.body;
    const { userData } = (req as IRequest).loggedInUser;

    // get the Right otp from db
    const userOTP = await this.otpRep.findOneDocument({
      userId: userData?._id,
    });

    if (!userOTP?.recovery || userOTP.expiration < new Date()) {
      throw new BadRequestException("otp Expired, send it again");
    }

    // compaire the OTPs together
    const otpIsMatched = await compareHashedData(
      otp.toString(),
      userOTP.recovery
    );
    if (!otpIsMatched) {
      throw new BadRequestException("wrong OTP");
    }

    // check if password and confirmPassword match
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    // if it is correct , hash the new password
    const hashedPassword = await hashingData(
      newPassword,
      parseInt(process.env.SALT_ROUNDS as string)
    );

    // update the password and desconnect all the devices
    userData!.password = hashedPassword;
    userData!.save();

    // send an email to inform the user about
    emitter.emit("sendEmail", {
      to: userData!.email,
      subject: `password Changed`,
      content: PASSWORD_CHANGED(),
    });

    res
      .status(200)
      .json({ msg: `Password has been changed, Now try to login` });
  };

  enable2FA = async (req: Request, res: Response) => {
    //get loggedIn user
    const { userData } = (req as IRequest).loggedInUser as { userData: IUser };

    // create OTP
    const nanoid = customAlphabet("1234567890", 6);
    const OTP: string = nanoid();
    const hasedOTP = await hashingData(
      OTP,
      parseInt(process.env.SALT_ROUNDS as string)
    );
    // send email with the OTP
    emitter.emit("sendEmail", {
      to: userData.email,
      subject: "Confirm 2 step verification",
      content: ENABLE_2FA_VERIFICATION(OTP),
    });

    // send the otp to the DB
    await this.otpRep.FindAndUpdateOrCreate(
      {
        userId: userData._id as Types.ObjectId,
      },
      {
        userId: userData._id as Types.ObjectId,
        confirm: hasedOTP,
        expiration: new Date(
          Date.now() + parseInt(process.env.OTPS_EXPIRES_IN_MIN!) * 60 * 1000
        ),
      }
    );

    res.status(200).json(SuccessResponse("OTP has been send to your email"));
  };

  confirm2FA = async (req: Request, res: Response) => {
    //get loggedIn user
    const { userData } = (req as IRequest).loggedInUser as { userData: IUser };
    const { OTP } = req.body;

    if (!OTP) throw new BadRequestException("please insert OTP");

    // find the otp of this user
    const userOTP = await this.otpRep.findOneDocument({ userId: userData._id });
    if (!userOTP || userOTP.expiration < new Date()) {
      throw new BadRequestException("otp Expired, try to reSend the otp again");
    }

    // check if the otp is correct
    const correctOTP: string = userOTP.confirm as string;
    const isCorrect = await compareHashedData(OTP, correctOTP);
    if (!isCorrect) {
      throw new BadRequestException("wrong OTP");
    }

    // delete the otp from DB
    await this.otpRep.deleteOneDocument({
      userId: userData._id,
    });

    // send email with the confirmation
    emitter.emit("sendEmail", {
      to: userData.email,
      subject: "2FA is enabled",
      content: TWO_FA_ENABLED_CONFIRMATION(),
    });

    // change 2FA state
    userData.twoStepVerification = true;
    await userData.save();

    res.status(200).json(SuccessResponse("OTP has been send to your email"));
  };

  disable2FA = async (req: Request, res: Response) => {
    //get loggedIn user
    const { userData } = (req as IRequest).loggedInUser as { userData: IUser };

    // check if the 2fa is enabled
    if (!userData.twoStepVerification)
      throw new BadRequestException("2FA is not enabled");

    // disable 2FA
    userData.twoStepVerification = false;
    await userData.save();

    res.status(200).json(SuccessResponse("2FA has been disabled"));
  };
}

export default new AuthService();
