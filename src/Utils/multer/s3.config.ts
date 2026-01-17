import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { storageEnum } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { createReadStream } from "node:fs";
import { BadRequestException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export const createPresignedURL = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path = "general",
  ContentType,
  originalname,
  expiresIn = 120,
}: {
  Bucket?: string;
  path?: string;
  ContentType: string;
  originalname: string;
  expiresIn?: number;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    Key: `${
      process.env.APPLICATION_NAME
    }/${path}/${uuid()}-presigned-${originalname}`,
    ContentType,
  });
  const url = await getSignedUrl(s3config(), command, { expiresIn });

  if (!command.input.Key || !url) {
    throw new BadRequestException("Fail to generate URL");
  }
  return { url, Key: command.input.Key };
};

export const getFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new GetObjectCommand({ Bucket, Key });
  return await s3config().send(command);
};

export const createGetPresignedURL = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
  expiresIn = 120,
}: {
  Bucket?: string;
  Key: string;
  expiresIn?: number;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });
  const url = await getSignedUrl(s3config(), command, { expiresIn });

  if (!url) {
    throw new BadRequestException("Fail to generate URL");
  }
  return url;
};

export const deleteFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}): Promise<DeleteObjectCommandOutput> => {
  const command = new DeleteObjectCommand({ Bucket, Key });
  return await s3config().send(command);
};

export const deleteFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  urls,
  Quiet = false,
}: {
  Bucket?: string;
  urls: string[];
  Quiet?: boolean;
}): Promise<DeleteObjectCommandOutput> => {
  const Objects = urls.map((url) => {
    return { Key: url };
  });
  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });
  return await s3config().send(command);
};
