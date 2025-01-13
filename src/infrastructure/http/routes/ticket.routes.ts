import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { CreateTicketUseCase } from '../../../application/use-cases/ticket/CreateTicketUseCase';
import { UpdateTicketStatusUseCase } from '../../../application/use-cases/ticket/UpdateTicketStatusUseCase';
import { ValidateTicketUseCase } from '../../../application/use-cases/ticket/ValidateTicketUseCase';
import { httpResponses } from '../responses/httpResponse';
import { TicketStatus } from '../../../domain/value-objects/TicketStatus';
import { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { basicLimiter } from '../middlewares/rateLimiter.middleware';
import { UserRole } from '../../../domain/value-objects/UserRole';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';

export const createTicketRouter = (dependencies: {
  ticketRepository: ITicketRepository;
  ticketTemplateRepository: ITicketTemplateRepository;
  eventRepository: IEventRepository;
  clientRepository: IClientRepository;
}) => {
  const router = Router();

  const createTicketUseCase = new CreateTicketUseCase(dependencies);
  const updateTicketStatusUseCase = new UpdateTicketStatusUseCase(dependencies);
  const validateTicketUseCase = new ValidateTicketUseCase(dependencies);

  // Crear ticket
  /**
   * @openapi
   * /tickets:
   *   post:
   *     tags:
   *       - Tickets
   *     summary: Create a ticket
   *     description: Create a ticket
  *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               templateId:
   *                 type: string
   *                 example: "677800024a136fc465ffed2e"
   *                 description: The id of the ticket template to use.
   *               eventId:
   *                 type: string
   *                 example: "677800024a136fc465ffe02r"
   *                 description: The id of the event where the ticket will be used.
   *               client:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     required: false
   *                     example: "677800024a136fc465ffe12e"
   *                     description: The id of the client. If not specified, the dni will be used to search for the client.
   *                   dni:
   *                     type: number
   *                     required: true
   *                     example: 30123456
   *                     description: The dni of the client. If not client found with this dni, the client will be created.
   *                   name:
   *                     type: string
   *                     required: true
   *                     example: "Juan Perez"
   *                     description: The complete name of the client.
   *                   birthDate:
   *                     type: string
   *                     required: true
   *                     example: "1990-01-01"
   *                     description: The birth date of the client.
   *                   email:
   *                     type: string
   *                     required: false
   *                     example: "juanperez@gmail.com"
   *                     description: The email of the client.
   *                   phone:
   *                     type: string
   *                     required: false
   *                     example: "3012345678"
   *                     description: The phone number of the client.
   *     security:
   *       - BearerAuth: []
   * 
   */
  router.post('/', 
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
        if(!req.user){
            httpResponses.unauthorized(res, 'No autorizado');
            return;
        }
        const ticket = await createTicketUseCase.execute(req.body, req.user._id); 
        httpResponses.created(res, ticket, 'Ticket creado exitosamente');
    } catch (error:any) {
        httpResponses.badRequest(res, error.message);
    }
  });


  // Validar ticket (para entrada al evento)
  /**
   * @openapi
   * /tickets/validate:
   *   post:
   *     tags:
   *       - Tickets
   *     summary: Validate a ticket for entry to the event
   *     description: Validate a ticket for entry to the event. If the ticket is valid, the ticket status is updated to UTILIZADO.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               ticketToken:
   *                 required: true
   *                 type: string
   *                 example: "1234567890"  
   *                 description: The token of the ticket to validate. The ticket's status must be PAGADO to be validated.
   *               location:
   *                 required: false
   *                 type: string
   *                 example: "Entrada Principal"
   *                 description: The location where the ticket was validated. This is used to track the entry point of the ticket.
   *               eventId:
   *                 required: true
   *                 type: string
   *                 example: "1234567890"
   *                 description: The id of the event where the ticket was validated.
   *     security:
   *       - BearerAuth: []
   */
  router.post('/validate', authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
        if(!req.user){
            httpResponses.unauthorized(res, 'No autorizado');
            return;
        }

      const {isValid,ticket} = await validateTicketUseCase.execute(
        req.body.ticketToken, 
        req.body.eventId
      );
      
      if (!isValid || !ticket) {
         httpResponses.unauthorized(res, 'Ticket inválido');
         return
      }

      // Si el ticket es válido, actualizamos su estado a USED
      await updateTicketStatusUseCase.execute(
        {
          ticketId: ticket.id,
          newStatus: TicketStatus.UTILIZADO,
          userId: req.user._id,
          metadata: {
            location: req.body.location || 'Entrada Principal',
            validatedBy: req.user._id
          }
        }
      );


       httpResponses.ok(res, { valid: true }, 'Ticket validado exitosamente');
    } catch (error:any) {
      console.log(error);
       httpResponses.badRequest(res, error.message);
    }
  });

  // Actualizar estado del ticket

  /**
   * @openapi
   * /tickets/{id}/status:
   *   patch:
   *     tags:
   *       - Tickets
   *     summary: Update the status of a ticket
   *     description: Update the status of a ticket
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The id of the ticket to update.
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 example: "ANULADO"
   *                 description: The new status of the ticket.
   *               metadata:
   *                 type: object
   *                 description: The metadata of the status change.
   *                 example: {
   *                   reason: "Cancellation ticket reason"
   *                 }
   *                 properties:  
   *                   reason:
   *                     type: string
   *                     description: The reason for the cancellation of the ticket.
   *     security:
   *       - BearerAuth: []
   */
  router.patch('/:id/status', authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
        if(!req.user){
            httpResponses.unauthorized(res, 'No autorizado');
            return;
        }
      const { status, metadata } = req.body;
      const ticket = await updateTicketStatusUseCase.execute(
        {
          ticketId: req.params.id,
          newStatus: status,
          userId: req.user._id,
          metadata: metadata
        }
      );
       httpResponses.ok(res, ticket, 'Estado del ticket actualizado exitosamente');
    } catch (error:any) {
       httpResponses.badRequest(res, error.message);
    }
  });

  /**
   * @openapi
   * /tickets/event/{eventId}:
   *   get:
   *     tags:
   *       - Tickets
   *     summary: Get tickets by event
   *     description: Get tickets by event
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: string
   *     security:
   *       - BearerAuth: []
   */
  // Obtener tickets por evento
  router.get('/event/:eventId', authenticate, async (req, res) => {
    const eventId=req.params.eventId;
    if(!eventId){
      httpResponses.badRequest(res, 'Evento no especificado');
      return;
    }
    try {
      const tickets = await dependencies.ticketRepository.findByEventId(eventId);
       httpResponses.ok(res, tickets);
    } catch (error:any) {
       httpResponses.serverError(res, error.message);
    }
  });

  // Obtener tickets por cliente
  router.get('/client/:clientId', authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      const tickets = await dependencies.ticketRepository.findByClientId(req.params.clientId);
       httpResponses.ok(res, tickets);
    } catch (error:any) {
       httpResponses.serverError(res, error);
    }
  });

  // Obtener historial de un ticket
  /**
   * @openapi
   * /tickets/{id}/history:
   *   get:
   *     tags:
   *       - Tickets
   *     summary: Get the history of a ticket
   *     description: Get the history of a ticket
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     security:
   *       - BearerAuth: []
   */
  router.get('/:id/history', authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      const ticket = await dependencies.ticketRepository.findById(req.params.id);
      if (!ticket) {
         httpResponses.notFound(res, 'Ticket no encontrado');
         return;
      }
       httpResponses.ok(res, ticket.history);
    } catch (error:any) {
       httpResponses.serverError(res, error.message);
    }
  });

  // Cancelar ticket
  /**
   * @openapi
   * /tickets/{id}/cancel:
   *   post:
   *     tags:
   *       - Tickets
   *     summary: Cancel a ticket
   *     description: Cancel a ticket
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: The reason for the cancellation of the ticket.
   *     security:
   *       - BearerAuth: []
   */
  router.post('/:id/cancel', authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {if(!req.user){
        httpResponses.unauthorized(res, 'No autorizado');
        return;
    }
      const ticket = await updateTicketStatusUseCase.execute(
        {
          ticketId: req.params.id,
          newStatus: TicketStatus.ANULADO,
          userId: req.user._id,
          metadata: {
            reason: req.body.reason || 'No especificado',
            cancelledBy: req.user._id
          }
        }
      );
       httpResponses.ok(res, ticket, 'Ticket cancelado exitosamente');
    } catch (error:any) {
       httpResponses.badRequest(res, error.message);
    }
  });

  return router;
}; 