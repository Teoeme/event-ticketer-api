import { Router } from 'express';
import { createAuthRouter } from './auth.routes';
import { createUserRouter } from './user.routes';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export const createRouter = (dependencies: {
  userRepository: IUserRepository;
}) => {
  const router = Router();

  router.use('/auth', createAuthRouter(dependencies.userRepository));
  router.use('/users', createUserRouter(dependencies));
  
  router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });

  return router;
}; 