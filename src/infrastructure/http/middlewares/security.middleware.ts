import helmet from 'helmet';
import slowDown from 'express-slow-down';
import { env } from '../../config/env';

// Configuración de Helmet
export const helmetMiddleware = helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
});

// Configuración de Speed Limiter
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // Dentro de los 15 minutos
  delayAfter: 500, // comenzar a ralentizar después de 500 solicitudes
  delayMs: (hits) => hits * 100, // aumentar el retraso en 100ms por cada solicitud
  maxDelayMs: 2000, // máximo retraso de 2 segundos
  skip: (req) => {
    // No ralentizar rutas estáticas o de salud
    return req.path.startsWith('/public') || req.path === '/health';
  }
}); 