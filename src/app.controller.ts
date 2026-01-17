import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { config } from "dotenv";
config({ path: path.resolve("./config/.env.dev") });
import authRouter from "./Modules/Auth/auth.controller";
import userRouter from "./Modules/User/user.controller";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import {
  BadRequestException,
  globalErrorHandler,
} from "./Utils/response/error.response";
import connectDB from "./DB/connection";
import {
  createGetPresignedURL,
  deleteFile,
  deleteFiles,
  getFile,
} from "./Utils/multer/s3.config";
import { UserModel } from "./DB/models/user.model";
import { generalFields } from "./Middlewares/validation.middleware";
import { UserRepository } from "./DB/repository/user.repository";

const createS3WriteStreamPipe = promisify(pipeline);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    status: 429,
    message: "Too many requests, please try again later",
  },
});

export const bootstrap = async () => {
  const app: Express = express();
  const port: number = Number(process.env.PORT) || 5000;

  app.use(cors(), express.json(), helmet());
  app.use(limiter);
  await connectDB();

  app.get("/uploads/pre-signed/*path", async (req: Request, res: Response) => {
    const { path } = req.params as unknown as { path: string[] };
    const Key = path.join("/");
    const url = await createGetPresignedURL({ Key });
    return res.status(200).json({ message: "Done", url });
  });

  app.get("/uploads/*path", async (req: Request, res: Response) => {
    const downloadName = req.query;
    const { path } = req.params as unknown as { path: string[] };
    const Key = path.join("/");
    const s3Response = await getFile({ Key });
    if (!s3Response) throw new BadRequestException("Fail to fetch asset");
    res.setHeader(
      "Content-Type",
      s3Response.ContentType || "application/octet-stream"
    );
    if (downloadName) {
      res.setHeader(
        "content-disposition",
        `attachments; filename="${downloadName}"`
      );
    }
    return await createS3WriteStreamPipe(
      s3Response.Body as NodeJS.ReadableStream,
      res
    );
  });

  app.get("/test-s3", async (req: Request, res: Response) => {
    const { Key } = req.query;
    const results = await deleteFile({ Key: Key as string });
    return res.status(200).json({ message: "Done", results });
  });

  app.get("/test", async (req: Request, res: Response) => {
    const { urls } = req.body;
    const results = await deleteFiles({ urls: urls.split(",") });
    return res.status(200).json({ message: "Done", results });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);

  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome to Social Media app" });
  });
  app.use("{/*dummy}", (req: Request, res: Response) => {
    res.status(404).json({ message: "Handler not found" });
  });
  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}`);
  });
};
