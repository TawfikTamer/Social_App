import { NextFunction, Request, Response } from "express";
import { IRequest } from "../Common";
import { verifyToken } from "../Utils";
import { BlackListedTokenRepository } from "../DB/Repositories";
import { blackListedTokensModel } from "../DB/models";

const blackListRep = new BlackListedTokenRepository(blackListedTokensModel);

export const verifyRefreshTokenMiddleware = async (
  req: Request | IRequest,
  res: Response,
  next: NextFunction
) => {
  // get the token from the header
  const { refreshtoken } = req.headers;
  // get the accsess token from the auth middleware
  if (!("loggedInUser" in req)) {
    (req as IRequest).loggedInUser = {};
  }
  const { accessTokenData } = (req as IRequest).loggedInUser;

  // check if the token is not send
  const [prefix, token] = (refreshtoken as string).split(" ");
  if (prefix !== process.env.JWT_TOKEN_PREFIX)
    return res.status(401).json({ msg: `invalid refresh token` });

  // verify the token
  const decodedData = verifyToken(token, process.env.JWT_REFRESH_KEY as string);
  if (!decodedData.jti)
    return res.status(401).json({ msg: "invalid payload from refresh token" });

  // check if the token is not revoked
  const isRevoked = await blackListRep.findOneDocument({
    refreshTokenId: decodedData.jti,
  });
  if (isRevoked)
    return res.status(401).json({ msg: "this refresh token is revoked" });

  // check if the access and refresh token belongs to the same user
  if (accessTokenData) {
    if (decodedData.jti != accessTokenData.refreshTokenId)
      return res.status(400).json({
        msg: `access and refresh tokens does not match for the same user`,
      });
  }

  (req as IRequest).loggedInUser.refreshTokenData = decodedData;

  next();
};
