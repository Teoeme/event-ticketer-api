import { randomBytes } from 'crypto';
import { TokenService } from '../../../domain/services/token/TokenService';
import { Event } from '../../../domain/entities/Event';
import { env } from '../../config/env';

/**
 * Servicio para generar y verificar tokens de eventos
 */
export class EventTokenService {
  private static readonly SECRET_LENGTH = 32;

  static generateEventSecret(): string {
    return randomBytes(this.SECRET_LENGTH).toString('hex');
  }

  static getTokenService(event: Event): TokenService {
    const secret = event.tokenSecret || env.jwtSecret;
    return new TokenService(secret);
  }
} 