import { ITokenDTO } from "../../../../application/dtos/TokenDTO";
import { IToken } from "../../../../domain/entities/Token";
import { ITokenRepository } from "../../../../domain/repositories/ITokenRepository";
import { TokenModel } from "../schemas/TokenSchema";

export class MongoTokenRepository implements ITokenRepository {
    async createToken(token: IToken): Promise<IToken> {
        const newToken = new TokenModel(token);
        await newToken.save();
        return newToken;
    }
    async findTokenByUserId(userId: string): Promise<IToken | null> {
        const token = await TokenModel.findOne({ userId });
        return token;
    }
    async deleteToken(token: IToken): Promise<void> {
        await TokenModel.deleteOne({ _id: token._id });
    }
    async cleanExpiredTokens(): Promise<void> {
        await TokenModel.deleteMany({ expiresAt: { $lt: new Date() } });
    }
    async findTokenByToken(token: string): Promise<IToken | null> {
        const result = await TokenModel.findOne({ token });
        return result;
    }

}