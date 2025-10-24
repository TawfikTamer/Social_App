import { Request, Response } from "express";
import { userModel } from "../../../DB/models";
import { UserRepository } from "../../../DB/Repositories";
import {
  BadRequestException,
  S3ClientService,
  SuccessResponse,
} from "../../../Utils";
import { IRequest } from "../../../Common";

class UserService {
  userRep: UserRepository = new UserRepository(userModel);
  s3 = new S3ClientService();

  uploadProfilePic = async (req: Request, res: Response) => {
    const { userData } = (req as IRequest).loggedInUser;
    const coverPic = req.file;

    // check for the user
    if (!userData) throw new BadRequestException("please login");

    // check if the file is not send
    if (!coverPic) throw new BadRequestException("please upload photo first");

    // upload the photo in AWS s3
    const { url, key_name } = await this.s3.uploadFileOnS3(
      coverPic as Express.Multer.File,
      `${userData?._id}/Profile-Pic`
    );

    // store the key in the DB
    userData.profilePicture = key_name;
    await userData.save();

    return res.status(200).json(
      SuccessResponse("profile-pic uploaded successfully", 200, {
        url,
        key_name,
      })
    );
  };

  uploadCoverPic = async (req: Request, res: Response) => {
    const { userData } = (req as IRequest).loggedInUser;
    const coverPic = req.file;

    // check for the user
    if (!userData) throw new BadRequestException("please login");

    // check if the file is not send
    if (!coverPic) throw new BadRequestException("please upload photo first");

    // upload the photo in AWS s3
    const { url, key_name } = await this.s3.uploadFileOnS3(
      coverPic as Express.Multer.File,
      `${userData?._id}/Cover-Pic`
    );

    // store the key in the DB
    userData.coverPicture = key_name;
    await userData.save();

    return res.status(200).json(
      SuccessResponse("cover-pic uploaded successfully", 200, {
        url,
        key_name,
      })
    );
  };

  renewSignedUrl = async (req: Request, res: Response) => {
    const { userData } = (req as IRequest).loggedInUser;
    const { key, key_type } = req.body as {
      key: string;
      key_type: "profilePicture" | "coverPicture";
    };

    // check for the user
    if (!userData) throw new BadRequestException("please login");

    // check if the key is exist in the user model
    if (!userData[key_type]) throw new BadRequestException("Invaild Key");

    // renew the url
    const url = await this.s3.getFileWithSignedURL(key);

    return res
      .status(200)
      .json(SuccessResponse("url has been renewed", 200, { url, key }));
  };

  updateProfileData = async (req: Request, res: Response) => {};
  updatePassword = async (req: Request, res: Response) => {};
  deleteAccount = async (req: Request, res: Response) => {};
  activateAccount = async (req: Request, res: Response) => {};
  deActivateAccount = async (req: Request, res: Response) => {};
  getProfileData = async (req: Request, res: Response) => {};
}

export default new UserService();
