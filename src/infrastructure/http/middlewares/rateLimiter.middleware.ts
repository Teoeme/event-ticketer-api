import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

// Limiter básico 
export const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
        max: 100, 
  message: {
    success: false,
    error: 'Demasiadas solicitudes, por favor intente más tarde'
  }
});

// Limiter específico para endpoints sensibles (email, auth, etc)
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 8, 
  message: {
    success: false,
    error: 'Límite de intentos excedido, por favor espere una hora'
  }
});

// Limiter para servicios externos con cuotas pagas (mailer)
export const externalServiceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    error: 'Límite de solicitudes excedido, por favor espere una hora'
  }
}); 