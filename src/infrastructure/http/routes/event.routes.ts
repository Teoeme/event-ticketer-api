import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { CreateEventUseCase } from '../../../application/use-cases/event/CreateEventUseCase';
import { UpdateEventUseCase } from '../../../application/use-cases/event/UpdateEventUseCase';
import { GetEventByIdUseCase } from '../../../application/use-cases/event/GetEventByIdUseCase';
import { ListEventsUseCase } from '../../../application/use-cases/event/ListEventsUseCase';
import { DeleteEventUseCase } from '../../../application/use-cases/event/DeleteEventUseCase';
import { ListActiveEventsUseCase } from '../../../application/use-cases/event/ListActiveEventsUseCase';
import { httpResponses } from '../responses/httpResponse';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { UserRole } from '../../../domain/value-objects/UserRole';
import { basicLimiter } from '../middlewares/rateLimiter.middleware';
import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';

export const createEventRouter = (dependencies: {
  eventRepository: IEventRepository;
  ticketTemplateRepository: ITicketTemplateRepository;
}) => {
  const router = Router();
  
  const createEventUseCase = new CreateEventUseCase(dependencies.eventRepository,dependencies.ticketTemplateRepository);
  const updateEventUseCase = new UpdateEventUseCase(dependencies.eventRepository,dependencies.ticketTemplateRepository);
  const getEventByIdUseCase = new GetEventByIdUseCase(dependencies.eventRepository);
  const listEventsUseCase = new ListEventsUseCase(dependencies.eventRepository);
  const deleteEventUseCase = new DeleteEventUseCase(dependencies.eventRepository);
  const listActiveEventsUseCase = new ListActiveEventsUseCase(dependencies.eventRepository);

  
 
  /**
   * @openapi
   * /events:
   *   post:
   *     tags:
   *       - Events
   *     summary: Create a new event
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *               - date
   *               - startTime
   *               - endTime
   *               - location
   *               - capacity
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Gran Evento Inicio de año"
  *               description:
   *                 type: string
   *                 example: "Gran evento de inicio de año para disfrutar con la familia"
   *               date:
   *                 type: string
   *                 format: date
   *                 example: "2025-01-01"
   *               startTime:
   *                 type: string
   *                 format: date-time
   *                 example: "2025-01-01T10:00:00Z"
   *               endTime:
   *                 type: string
   *                 format: date-time
   *                 example: "2025-01-01T15:00:00Z"
   *               location:
   *                 type: string
   *                 example: "Parque de los Próceres"
   *               capacity:
   *                 type: number
   *                 example: 4000
   *               isActive:
   *                 type: boolean
   *                 example: true
   *               ticketTemplates:
   *                 type: array
   *                 description: The ids of the ticket templates
   *                 example: ["1234567890","1234567891"]
   *    
   */
  router.post('/',
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      const event = await createEventUseCase.execute({...req.body,
        date: new Date(req.body.date),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)});
       httpResponses.created(res, event, 'Evento creado exitosamente');
    } catch (error: any) {
       httpResponses.badRequest(res, error.message);
    }
  });

  /**
   * @openapi
   * /events:
   *   get:
   *     tags:
   *       - Events
   *     summary: Get all events
   *     security:
   *       - bearerAuth: []
   */
  router.get('/',
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      const events = await listEventsUseCase.execute();
      httpResponses.ok(res, events, 'Eventos listados exitosamente');
    } catch (error: any) {
      httpResponses.serverError(res, error.message);
    }
  });

  /**
   * @openapi
   * /events/active:
   *   get:
   *     tags:
   *       - Events
   *     summary: Get active events
   *     security:
   *       - bearerAuth: []
   */
  router.get('/active',
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      const events = await listActiveEventsUseCase.execute();
      httpResponses.ok(res, events, 'Eventos activos listados exitosamente');
    } catch (error: any) {
      httpResponses.serverError(res, error.message);
    }
  });

  /**
   * @openapi
   * /events/{id}:
   *   get:
   *     tags:
   *       - Events
   *     summary: Get an event by id
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: The id of the event
   *         schema:
   *           type: string
   */
  router.get('/:id',
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      const event = await getEventByIdUseCase.execute(req.params.id);
      if (!event) {
         httpResponses.notFound(res, 'Evento no encontrado');
      }
      httpResponses.ok(res, event);
    } catch (error: any) {
      httpResponses.serverError(res, error.message);
    }
  });

  /**
   * @openapi
   * /events/{id}:
   *   put:
   *     tags:
   *       - Events
   *     summary: Update an event by id
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: The id of the event
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               date:
   *                 type: string
   *                 format: date
   *               startTime:
   *                 type: string
   *                 format: date-time
   *               endTime:
   *                 type: string
   *                 format: date-time
   *               location:
   *                 type: string
   *               capacity:
   *                 type: number
   *               isActive:
   *                 type: boolean
   *               ticketTemplates:
   *                 description: The ids of the ticket templates
   *                 type: array
   *                 example: ["1234567890","1234567891"]
   */
  router.put('/:id',
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      const event = await updateEventUseCase.execute(req.params.id, req.body);
      httpResponses.ok(res, event, 'Evento actualizado exitosamente');
    } catch (error: any) {
      httpResponses.badRequest(res, error.message);
    }
  });

  /**
   * @openapi
   * /events/{id}:
   *   delete:
   *     tags:
   *       - Events
   *     summary: Delete an event by id
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: The id of the event
   *         schema:
   *           type: string
   */
  router.delete('/:id',
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      await deleteEventUseCase.execute(req.params.id);
      httpResponses.ok(res, null, 'Evento eliminado exitosamente');
    } catch (error: any) {
      httpResponses.badRequest(res, error.message);
    }
  });

  return router;
}; 