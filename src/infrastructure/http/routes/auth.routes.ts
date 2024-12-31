import { Router } from 'express';
import passport from 'passport';
import { AuthenticateUserUseCase } from '../../../application/use-cases/auth/AuthenticateUserUseCase';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { env } from '../../config/env';
import { UserRole } from '../../../domain/value-objects/UserRole';
import { AuthProvider } from '../../../domain/value-objects/AuthProvider';

declare global {
  namespace Express {
    interface User {
        _id: string;
        email: string;
        name: string;
        role: UserRole;
    }
  }
}

export const createAuthRouter = (userRepository: IUserRepository) => {
  const router = Router();
  const authenticateUseCase = new AuthenticateUserUseCase({userRepository, jwtSecret: env.jwtSecret});

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Login with email and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   */
  router.post('/login', 
    passport.authenticate('local', { 
        session: false,
    }),
    async (req, res) => {
      try {
        const { token, user } = await authenticateUseCase.execute(
          req.body.email,
          req.body.password
        );
        res.json({ token, user });
      } catch (error) {
        res.status(401).json({ message: 'Autenticación fallida' });
      }
    }
  );

  /**
   * @openapi
   * /auth/google:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Login with Google
   *     description: Redirect to Google login page, needs user already exists in database
   */
  router.get('/google',
    passport.authenticate('google', { 
      scope: ['profile', 'email']
    })
  );

  router.get('/google/callback',
    passport.authenticate('google', { 
      session: false,
      failureRedirect: '/login'
    }),
    async (req, res) => {
      try {
        if(!req.user?.email) {
          throw new Error('No se pudo obtener el email del usuario desde Google');
        }
        const { token, user } = await authenticateUseCase.execute(
          req.user.email,
          '',
          AuthProvider.GOOGLE
        );
        res.redirect(`${env.frontendUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.log(error,'error');
        res.redirect('/login');
      }
    }
  );

  return router;
}; 