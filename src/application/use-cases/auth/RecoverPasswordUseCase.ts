import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEmailService } from '../../../domain/services/IEmailService';
import jwt from 'jsonwebtoken';
import { env } from '../../../infrastructure/config/env';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { TokenType } from '../../../domain/value-objects/TokenType';
import { createPasswordRecoveryEmailTemplate } from '../../../infrastructure/services/email/templates/passwordRecovery';

export class RecoverPasswordUseCase {
  constructor(private dependencies: { emailService: IEmailService, userRepository: IUserRepository, tokenRepository: ITokenRepository }) {  }

  async execute(userEmail: string) {
    const user = await this.dependencies.userRepository.findByEmail(userEmail);
    if (!user) {
      // throw new Error('Usuario no encontrado');
      return //Hacemos un return para que no se muestre el error en la respuesta, y no exponer la inexistencia del usuario
    }

    const haveRecentRequest = await this.haveRecentRequest(user._id);
    if (haveRecentRequest) {
      throw new Error('Ya hay una solicitud de recuperación de contraseña reciente. Por favor revise su correo, recuerde verificar la carpeta de spam o correo no deseado. En caso de no hallarlo, podrá intentarlo nuevamente más tarde.');
    }

    const token = jwt.sign({ userId: user._id }, env.jwtSecret, { expiresIn: env.recoverPasswordTokenExpiration });

    await this.dependencies.tokenRepository.createToken({
      token,
      userId: user._id,
      expiresAt: new Date(Date.now() + this.parseHumanTimeToMs(env.recoverPasswordTokenExpiration)),
      type: TokenType.PASSWORD_RECOVERY
    })

    const resetLink = `${env.frontendUrl}/reset-password?token=${token}`;
    const expirationTime = this.humanizeTime(env.recoverPasswordTokenExpiration);

    const emailHtml = createPasswordRecoveryEmailTemplate(
      user.name,
      resetLink,
      expirationTime
    );

    await this.dependencies.emailService.sendEmail({
      to: user.email,
      subject: `Recuperación de contraseña - ${env.appName}`,
      html: emailHtml
    });
  }

  parseHumanTimeToMs(time: string): number {
    const timeParts = time.split('');
    const unit=timeParts.pop();
    const number = parseInt(timeParts.join(''));
    switch (unit) {
      case 's': return number * 1000;
      case 'm': return number * 60 * 1000;
      case 'h': return number * 60 * 60 * 1000;
      case 'd': return number * 24 * 60 * 60 * 1000;
      default: return number;
    }
  }

  async haveRecentRequest(userId: string): Promise<boolean> {
    await this.dependencies.tokenRepository.cleanExpiredTokens();
    const token = await this.dependencies.tokenRepository.findTokenByUserId(userId) || false
    return token && token.expiresAt && token.expiresAt > new Date() && token.type === TokenType.PASSWORD_RECOVERY;
  }

  private humanizeTime(time: string): string {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1));
    
    switch (unit) {
      case 'h': return `${value} ${value === 1 ? 'hora' : 'horas'}`;
      case 'd': return `${value} ${value === 1 ? 'día' : 'días'}`;
      case 'm': return `${value} ${value === 1 ? 'minuto' : 'minutos'}`;
      default: return time;
    }
  }
}