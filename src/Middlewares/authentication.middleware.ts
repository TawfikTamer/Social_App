import { NextFunction, Request, Response } from "express";
import { IRequest, IUser } from "../Common";
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  verifyToken,
} from "../Utils";
import { BlackListedTokenRepository, UserRepository } from "../DB/Repositories";
import { blackListedTokensModel, userModel } from "../DB/models";

const userRep = new UserRepository(userModel);
const blackListRep = new BlackListedTokenRepository(blackListedTokensModel);

export const authenticationMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { accesstoken, recoverytoken } = req.headers as {
    accesstoken: string;
    recoverytoken: string;
  };

  if (!accesstoken && !recoverytoken)
    throw new BadRequestException("please insert token");

  const givenToken = accesstoken || recoverytoken;
  const [prefix, token] = (givenToken as string).split(" ");
  if (prefix !== process.env.JWT_TOKEN_PREFIX)
    throw new BadRequestException("invalid token");

  const decodedData = verifyToken(token, process.env.JWT_ACCESS_KEY as string);
  if (!decodedData.jti) throw new BadRequestException("invalid token");

  const isRevoked = await blackListRep.findOneDocument({
    accsessTokenId: decodedData.jti,
  });
  if (isRevoked) throw new ConflictException("this token is revoked");

  const userData: IUser | null = await userRep.findDocumentById(
    decodedData._id
  );
  if (!userData) throw new UnauthorizedException(`register first`);

  (req as IRequest).loggedInUser = { userData, accessTokenData: decodedData };

  next();
};
