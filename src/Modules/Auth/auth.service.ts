import type { Request, Response } from "express";
import { ILoginDTO, ISignupDTO } from "./auth.dto";

class AuthenticationService {
  constructor() {}
  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password, confirmPassword }: ISignupDTO = req.body;
    console.log({ username, email, password, confirmPassword });
    return res.status(201).json({ message: "User Created Successfully" });
  };
  login = (req: Request, res: Response) => {
    const { email, password }: ILoginDTO = req.body;
    console.log({ email, password });
    return res.status(200).json({ message: "User Logged in Successfully" });
  };
}

export default new AuthenticationService();
