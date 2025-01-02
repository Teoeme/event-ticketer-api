import { IToken } from "../entities/Token";

export interface ITokenRepository {
    createToken(token: Omit<IToken, '_id'>): Promise<IToken>;
    findTokenByUserId(userId: string): Promise<IToken | null>;
    deleteToken(token: IToken): Promise<void>;
    cleanExpiredTokens(): Promise<void>;
    findTokenByToken(token: string): Promise<IToken | null>;
}