import { TokenType } from "../../domain/value-objects/TokenType";

export interface ITokenDTO {
    token: string;
    userId: string;
    expiresAt?: Date;
    type: TokenType
}