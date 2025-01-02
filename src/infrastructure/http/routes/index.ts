import { Router } from 'express';
import { createAuthRouter } from './auth.routes';
import { createUserRouter } from './user.routes';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEmailService } from '../../../domain/services/IEmailService';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';

export const createRouter = (dependencies: {
  userRepository: IUserRepository;
  emailService: IEmailService;
  tokenRepository: ITokenRepository;
}) => {
  const router = Router();

  router.use('/auth', createAuthRouter(dependencies.userRepository));
  router.use('/users', createUserRouter(dependencies));
  
  router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });

  return router;
}; 