import { Model } from "mongoose";

import { IFriendRequest } from "../models/friendrequest.model";
import { DatabaseRepository } from "./database.repository";

export class FriendRequestRepository extends DatabaseRepository<IFriendRequest> {
  constructor(protected override readonly model: Model<IFriendRequest>) {
    super(model);
  }
}
