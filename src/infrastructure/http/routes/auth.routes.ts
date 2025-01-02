import { Router } from 'express';
import passport from 'passport';
import { AuthenticateUserUseCase } from '../../../application/use-cases/auth/AuthenticateUserUseCase';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { env } from '../../config/env';
import { UserRole } from '../../../domain/value-objects/UserRole';
import { AuthProvider } from '../../../domain/value-objects/AuthProvider';
import { externalServiceLimiter, strictLimiter } from '../middlewares/rateLimiter.middleware';
import { IEmailService } from '../../../domain/services/IEmailService';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { RecoverPasswordUseCase } from '../../../application/use-cases/auth/RecoverPasswordUseCase';
import { httpResponses } from '../responses/httpResponse';
import { ResetPasswordUseCase } from '../../../application/use-cases/auth/ResetPasswordUseCase';

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

export const createAuthRouter = (dependencies: {
  userRepository: IUserRepository;
  emailService: IEmailService;
  tokenRepository: ITokenRepository;
}) => {
  const router = Router();
  const authenticateUseCase = new AuthenticateUserUseCase({userRepository: dependencies.userRepository, jwtSecret: env.jwtSecret});

    const recoverPasswordUseCase = new RecoverPasswordUseCase({
    emailService: dependencies.emailService,
    userRepository: dependencies.userRepository,
    tokenRepository: dependencies.tokenRepository
  });

  const resetPasswordUseCase = new ResetPasswordUseCase({
    userRepository: dependencies.userRepository,
    tokenRepository: dependencies.tokenRepository
  });

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
    strictLimiter,
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




  /**
   * @openapi
   * /auth/recover-password/{userEmail}:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Send password recovery email
   *     parameters:
   *       - in: path
   *         name: userEmail
   *         required: true
   *         schema:
   *           type: string
   */
  router.post('/recover-password/:userEmail',
    externalServiceLimiter,
    async (req, res) => {
    try {
      await recoverPasswordUseCase.execute(req.params.userEmail);
      httpResponses.ok(res,'Email de recuperacion de contraseña enviado correctamente. Verifíque su correo electrónico, recuerde revisar la carpeta de spam.')
    } catch (error:any) {
      console.log(error,'Error al enviar email de recuperacion de contraseña');
      httpResponses.serverError(res,error.message)
    }
  }
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token to reset the password
 *                 example: 'eyJhbGciOiJIUzI....FbPrdB25xx_4rj3A6YJhqs_dlMeDVIhoyfJbuhjlbBI'
 *               newPassword:
 *                 type: string
 *                 description: The new password to set
 *                 example: 'New_Password_123!'
 */
router.post('/reset-password',
  strictLimiter,
  async (req, res) => {
    if(!req.body.token || !req.body.newPassword) {
      httpResponses.badRequest(res,'Token y contraseña son requeridos');
      return;
    }
    try {
      await resetPasswordUseCase.execute(req.body.token, req.body.newPassword);
      httpResponses.ok(res,'Contraseña restablecida correctamente');
    } catch (error:any) {
      httpResponses.serverError(res,error.message)
    }
  }
)

  return router;
}; 