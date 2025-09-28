import { NextFunction, Request, Response } from "express";
import { IRequest, IUser } from "../Common";
import { verifyToken } from "../Utils";
import { BlackListedTokenRepository, UserRepository } from "../DB/Repositories";
import { blackListedTokensModel, userModel } from "../DB/models";

const userRep = new UserRepository(userModel);
const blackListRep = new BlackListedTokenRepository(blackListedTokensModel);

export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { accesstoken } = req.headers as { accesstoken: string };

  if (!accesstoken) return res.status(401).json({ msg: `please insert token` });

  const [prefix, token] = (accesstoken as string).split(" ");
  if (prefix !== process.env.JWT_TOKEN_PREFIX)
    return res.status(401).json({ msg: `invalid token` });

  const decodedData = verifyToken(token, process.env.JWT_ACCESS_KEY as string);
  if (!decodedData.jti) return res.status(401).json({ msg: "invalid payload" });

  const isRevoked = await blackListRep.findOneDocument({ accsessTokenId: decodedData.jti });
  if (isRevoked) return res.status(401).json({ msg: "this token is revoked" });

  const userData: IUser | null = await userRep.findDocumentById(decodedData._id);
  if (!userData) return res.status(401).json({ msg: `register first` });

  (req as IRequest).loggedInUser = { userData, token: decodedData };

  next();
};
