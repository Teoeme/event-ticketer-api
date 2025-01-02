import { TokenType } from "../value-objects/TokenType";

export interface IToken {
  _id: string;
  userId: string;
  expiresAt: Date;
  type: TokenType;
  token: string;
}