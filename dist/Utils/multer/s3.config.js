"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFiles = exports.deleteFile = exports.createGetPresignedURL = exports.getFile = exports.createPresignedURL = exports.uploadFiles = exports.uploadLargeFile = exports.uploadFile = exports.s3config = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const cloud_multer_1 = require("./cloud.multer");
const uuid_1 = require("uuid");
const node_fs_1 = require("node:fs");
const error_response_1 = require("../response/error.response");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3config = () => {
    return new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
};
exports.s3config = s3config;
const uploadFile = async ({ storageApproach = cloud_multer_1.storageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-${file.originalname}`,
        Body: storageApproach === cloud_multer_1.storageEnum.MEMORY
            ? file.buffer
            : (0, node_fs_1.createReadStream)(file.path),
        ContentType: file.mimetype,
    });
    await (0, exports.s3config)().send(command);
    if (!command?.input?.Key)
        throw new error_response_1.BadRequestException("Fail to upload file");
    return command.input.Key;
};
exports.uploadFile = uploadFile;
const uploadLargeFile = async ({ storageApproach = cloud_multer_1.storageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3config)(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-${file.originalname}`,
            Body: storageApproach === cloud_multer_1.storageEnum.MEMORY
                ? file.buffer
                : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype,
        },
        partSize: 500 * 1024 * 1024,
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log("upload progress", progress);
    });
    const { Key } = await upload.done();
    if (!Key)
        throw new error_response_1.BadRequestException("Fail to Upload File");
    return Key;
};
exports.uploadLargeFile = uploadLargeFile;
const uploadFiles = async ({ storageApproach = cloud_multer_1.storageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", files, }) => {
    let urls = [];
    urls = await Promise.all(files.map((file) => {
        return (0, exports.uploadFile)({ storageApproach, Bucket, ACL, path, file });
    }));
    return urls;
};
exports.uploadFiles = uploadFiles;
const createPresignedURL = async ({ Bucket = process.env.AWS_BUCKET_NAME, path = "general", ContentType, originalname, expiresIn = 120, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-presigned-${originalname}`,
        ContentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3config)(), command, { expiresIn });
    if (!command.input.Key || !url) {
        throw new error_response_1.BadRequestException("Fail to generate URL");
    }
    return { url, Key: command.input.Key };
};
exports.createPresignedURL = createPresignedURL;
const getFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.GetObjectCommand({ Bucket, Key });
    return await (0, exports.s3config)().send(command);
};
exports.getFile = getFile;
const createGetPresignedURL = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, expiresIn = 120, }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3config)(), command, { expiresIn });
    if (!url) {
        throw new error_response_1.BadRequestException("Fail to generate URL");
    }
    return url;
};
exports.createGetPresignedURL = createGetPresignedURL;
const deleteFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.DeleteObjectCommand({ Bucket, Key });
    return await (0, exports.s3config)().send(command);
};
exports.deleteFile = deleteFile;
const deleteFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, urls, Quiet = false, }) => {
    const Objects = urls.map((url) => {
        return { Key: url };
    });
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet,
        },
    });
    return await (0, exports.s3config)().send(command);
};
exports.deleteFiles = deleteFiles;
