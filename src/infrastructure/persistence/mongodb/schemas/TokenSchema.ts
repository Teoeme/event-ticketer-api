import mongoose from "mongoose";
import { IToken } from "../../../../domain/entities/Token";
import { TokenType } from "../../../../domain/value-objects/TokenType";

const tokenSchema = new mongoose.Schema<IToken>({
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    type: { 
      type: String, 
      enum: Object.values(TokenType),
      required: true 
    },
    token: { type: String, required: true },
  });
  
  export const TokenModel =  mongoose.models.Token || mongoose.model<IToken>('Token', tokenSchema);

  