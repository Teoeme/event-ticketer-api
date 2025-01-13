import { Router } from 'express';
import { createAuthRouter } from './auth.routes';
import { createUserRouter } from './user.routes';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEmailService } from '../../../domain/services/IEmailService';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { createEventRouter } from './event.routes';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { createTicketTemplateRouter } from './ticketTemplate.routes';
import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';
import { createTicketRouter } from './ticket.routes';
import { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { createClientRouter } from './client.routes';

export const createRouter = (dependencies: {
  userRepository: IUserRepository;
  emailService: IEmailService;
  tokenRepository: ITokenRepository;
  eventRepository: IEventRepository;
  ticketTemplateRepository: ITicketTemplateRepository;
  ticketRepository: ITicketRepository;
  clientRepository: IClientRepository;
}) => {
  const router = Router();

  router.use('/auth', createAuthRouter(dependencies));
  router.use('/users', createUserRouter(dependencies));
  router.use('/events', createEventRouter(dependencies));
  router.use('/ticket-templates', createTicketTemplateRouter(dependencies));
  router.use('/tickets', createTicketRouter(dependencies));
  router.use('/clients', createClientRouter(dependencies));
  
  router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });

  return router;
}; 