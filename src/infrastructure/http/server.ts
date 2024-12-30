import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import passport from 'passport';
import { env } from '../config/env';

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
        url: `http://localhost:${env.port}`,
      },
    ],
  },
  apis: ['./src/infrastructure/http/routes/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Base route
app.get('/', (req, res) => {
  res.send('Tickets API is running!');
});

export const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  console.log(`Documentation available at http://localhost:${env.port}/api-docs`);
});

export default app; 