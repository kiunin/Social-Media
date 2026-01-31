import { JwtPayload } from "jsonwebtoken";
import { HUserDocument } from "../../DB/models/user.model";
import { Socket } from "socket.io";

export interface IAuthSocket extends Socket {
  credentials?: {
    user: Partial<HUserDocument>;
    decoded: JwtPayload;
  };
}
