import { ITokenRepository } from "../../../domain/repositories/ITokenRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import bcrypt from 'bcrypt';

export class ResetPasswordUseCase {
  constructor(private dependencies: { userRepository: IUserRepository, tokenRepository: ITokenRepository }) {  }

  async execute(token: string, newPassword: string) {
const tokenData = await this.dependencies.tokenRepository.findTokenByToken(token);
if(!tokenData) {
  throw new Error('Token no encontrado');
}

if(tokenData.expiresAt < new Date()) {
  throw new Error('Token expirado');
}

const user = await this.dependencies.userRepository.findById(tokenData.userId);
if(!user) {
  throw new Error('Usuario no encontrado');
}

    const hashedPassword = await bcrypt.hash(newPassword, 10);

await this.dependencies.userRepository.update(user._id, {
    ...user,
    password: hashedPassword
});

await this.dependencies.tokenRepository.deleteToken(tokenData);
}
}
