import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import passport from 'passport';
import { env } from '../config/env';
import { configurePassport } from '../config/passport';
import { createRouter } from './routes';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../domain/services/IEmailService';
import { helmetMiddleware, speedLimiter } from './middlewares/security.middleware';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { ITicketTemplateRepository } from '../../domain/repositories/ITicketTemplateRepository';
import { ITicketRepository } from '../../domain/repositories/ITicketRepository';
import { IClientRepository } from '../../domain/repositories/IClientRepository';

export const createServer = (dependencies: {
  userRepository: IUserRepository;
  emailService: IEmailService;
  tokenRepository: ITokenRepository;
  eventRepository: IEventRepository;
  ticketTemplateRepository: ITicketTemplateRepository;
  ticketRepository: ITicketRepository;
  clientRepository: IClientRepository;
}) => {
  const app = express();

  app.use(helmetMiddleware);
  app.use(speedLimiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());

  // Configuración de Swagger
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Tickets API',
        version: '1.0.0',
        description: 'API for event ticket management',
      },
      servers: [
        {
          url: `${env.backendUrl}/api`,
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    
    },
    apis: ['./src/infrastructure/http/routes/*.ts'],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  configurePassport(dependencies.userRepository);

  app.use('/api', createRouter(dependencies));

  return app;
};

 