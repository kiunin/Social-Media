import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import os from "node:os";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../response/error.response";

export enum storageEnum {
  MEMORY = "MEMORY",
  DISK = "DISK",
}
export const fileValidation = {
  image: ["image/png", "image/jpeg", "image/jpg"],
  pdf: ["application/pdf"],
  doc: ["application/msword"],
};

export const cloudFileUpload = ({
  validation = [],
  storageApproach = storageEnum.MEMORY,
  maxSizeMb = 2,
}: {
  validation?: string[];
  storageApproach?: storageEnum;
  maxSizeMb?: number;
}) => {
  const storage =
    storageApproach === storageEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: os.tmpdir(),
          filename: (req: Request, file: Express.Multer.File, cb) => {
            cb(null, `${uuid()}-${file.originalname}`);
          },
        });

  function fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) {
    if (!validation.includes(file.mimetype)) {
      return cb(new BadRequestException("Invalid File Type"));
    }
    return cb(null, true);
  }
  return multer({
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    storage,
  });
};
