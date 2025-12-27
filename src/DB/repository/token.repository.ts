import { Model } from "mongoose";
import { IToken } from "../models/token.model";
import { DatabaseRepository } from "./database.repository";

export class TokenRepository extends DatabaseRepository<IToken> {
  constructor(protected override readonly model: Model<IToken>) {
    super(model);
  }
}
