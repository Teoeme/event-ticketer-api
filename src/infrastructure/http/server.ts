import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import passport from 'passport';
import { env } from '../config/env';
import { configurePassport } from '../config/passport';
import { createRouter } from './routes';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export const createServer = (dependencies: {
  userRepository: IUserRepository;
}) => {
  const app = express();

  // Middleware básico
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
          url: `${env.apiUrl}`,
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

  // Configurar Passport
  configurePassport(dependencies.userRepository);

  // Montar el router principal
  app.use('/api', createRouter(dependencies));

  return app;
};

 