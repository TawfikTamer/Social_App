import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs, { ReadStream } from "node:fs";

interface IPutObjectCommandInput extends PutObjectCommandInput {
  Body: string | Buffer | ReadStream;
}

export class S3ClientService {
  private key_folder = process.env.AWS_KEY_FOLDER;

  private s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID as string,
      secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
    },
  });

  async getFileWithSignedURL(key_name: string, expiresIn: number = 60) {
    const getCommand = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key_name,
    });

    return await getSignedUrl(this.s3Client, getCommand, { expiresIn });
  }

  async uploadFileOnS3(file: Express.Multer.File, key: string) {
    const key_name = `${this.key_folder}/${key}/${Date.now()}-${
      file.originalname
    }`;

    const params: IPutObjectCommandInput = {
      Bucket: process.env.BUCKET_NAME,
      Key: key_name,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
    };

    const putCommand = new PutObjectCommand(params);
    await this.s3Client.send(putCommand);

    const singedURL = await this.getFileWithSignedURL(key_name);
    return {
      key_name,
      url: singedURL,
    };
  }

  async deleteFileFromS3(key_name: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key_name,
    });

    return await this.s3Client.send(deleteCommand);
  }

  async deleteFolderFromS3(userID: string) {
    const user_key_name = `${this.key_folder}/${userID}`;

    // list all the keys in the user folder
    const userKeysParams = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: user_key_name,
    });

    const userKeys = await this.s3Client.send(userKeysParams);

    // check if there is no keys to delete
    if (!userKeys.Contents) return null;

    const keysObject = userKeys.Contents?.map((element) => {
      return { Key: element.Key };
    });

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.BUCKET_NAME,
      Delete: {
        Objects: keysObject,
      },
    });

    return await this.s3Client.send(deleteCommand);
  }

  async deleteManyFilesFromS3(keys: string[]) {
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => {
          return { Key: key };
        }),
      },
    });

    return await this.s3Client.send(deleteCommand);
  }
}
