import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { storageEnum } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { Multer } from "multer";
import { createReadStream } from "node:fs";
import { BadRequestException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage";
import { promise } from "zod";

export const s3config = () => {
  return new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
};

export const uploadFile = async ({
  storageApproach = storageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproach?: storageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
      file.originalname
    }`,
    Body:
      storageApproach === storageEnum.MEMORY
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype,
  });

  await s3config().send(command);
  if (!command?.input?.Key)
    throw new BadRequestException("Fail to upload file");

  return command.input.Key;
};

export const uploadLargeFile = async ({
  storageApproach = storageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproach?: storageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const upload = new Upload({
    client: s3config(),
    params: {
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
        file.originalname
      }`,
      Body:
        storageApproach === storageEnum.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    },
    partSize: 500 * 1024 * 1024,
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log("upload progress", progress);
  });

  const { Key } = await upload.done();
  if (!Key) throw new BadRequestException("Fail to Upload File");

  return Key;
};

export const uploadFiles = async ({
  storageApproach = storageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  files,
}: {
  storageApproach?: storageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
}) => {
  let urls: string[] = [];
  urls = await Promise.all(
    files.map((file) => {
      return uploadFile({ storageApproach, Bucket, ACL, path, file });
    })
  );
  // for(const file of files){
  //     const key = await uploadFile({
  //         storageApproach,
  //         Bucket,
  //         ACL,
  //         path,
  //         file,
  //     });
  //     urls.push(key);
  // }
  return urls;
};
