import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Servicio para generar y verificar tokens
 * un token sera valido si ha sido generado con la misma secretKey y no ha expirado
 */
export class TokenService {
  constructor(private readonly secretKey: string) {}

  /**
   * Genera un token para un ticket
   * @param ticketData
   * @param expiration string de duracion del token por defecto 365d, puede ser cualquier string valido para jwt s,m,h,d,y
   * @returns 
   */
  generateTicketToken(ticketData: {
    eventId: string;
    templateId: string;
    clientId: string;
    timestamp: number;
  },expiration:string='365d'): string {
    // Versión con JWT
    return jwt.sign(ticketData, this.secretKey, {
      expiresIn: expiration // Los tickets normalmente no expiran
    });
  }

  verifyToken(token: string): boolean {
    try {
      jwt.verify(token, this.secretKey);
      return true;
    } catch {
      return false;
    }
  }
} 