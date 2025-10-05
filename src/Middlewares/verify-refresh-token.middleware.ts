import { NextFunction, Request, Response } from "express";
import { IRequest } from "../Common";
import { BadRequestException, ConflictException, verifyToken } from "../Utils";
import { BlackListedTokenRepository } from "../DB/Repositories";
import { blackListedTokensModel } from "../DB/models";

const blackListRep = new BlackListedTokenRepository(blackListedTokensModel);

export const verifyRefreshTokenMiddleware = async (
  req: Request | IRequest,
  _res: Response,
  next: NextFunction
) => {
  // get the token from the header
  const { refreshtoken } = req.headers;
  if (!refreshtoken) throw new BadRequestException("please insert token");

  // get the accsess token from the auth middleware
  if (!("loggedInUser" in req)) {
    (req as IRequest).loggedInUser = {};
  }
  const { accessTokenData } = (req as IRequest).loggedInUser;

  // check if the token is not send
  const [prefix, token] = (refreshtoken as string).split(" ");
  if (prefix !== process.env.JWT_TOKEN_PREFIX)
    throw new BadRequestException("invalid refresh token");

  // verify the token
  const decodedData = verifyToken(token, process.env.JWT_REFRESH_KEY as string);
  if (!decodedData.jti) throw new BadRequestException("invalid refresh token");

  // check if the token is not revoked
  const isRevoked = await blackListRep.findOneDocument({
    refreshTokenId: decodedData.jti,
  });
  if (isRevoked) throw new ConflictException("this token is revoked");

  // check if the access and refresh token belongs to the same user
  if (accessTokenData) {
    if (decodedData.jti != accessTokenData.refreshTokenId)
      throw new ConflictException(
        "access and refresh tokens does not match for the same user"
      );
  }

  (req as IRequest).loggedInUser.refreshTokenData = decodedData;

  next();
};
