import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { CreateTicketTemplateUseCase } from '../../../application/use-cases/ticketTemplate/CreateTicketTemplateUseCase';
import { UpdateTicketTemplateUseCase } from '../../../application/use-cases/ticketTemplate/UpdateTicketTemplateUseCase';
import { GetTicketTemplateByEventUseCase } from '../../../application/use-cases/ticketTemplate/GetTicketTemplateByEventUseCase';
import { DeleteTicketTemplateUseCase } from '../../../application/use-cases/ticketTemplate/DeleteTicketTemplateUseCase';
import { httpResponses } from '../responses/httpResponse';
import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';
import { UserRole } from '../../../domain/value-objects/UserRole';
import { basicLimiter } from '../middlewares/rateLimiter.middleware';

export const createTicketTemplateRouter = (dependencies: {
  ticketTemplateRepository: ITicketTemplateRepository;
}) => {
  const router = Router();
  
  const createTicketTemplateUseCase = new CreateTicketTemplateUseCase(dependencies.ticketTemplateRepository);
  const updateTicketTemplateUseCase = new UpdateTicketTemplateUseCase(dependencies.ticketTemplateRepository);
  const getTicketTemplateByEventUseCase = new GetTicketTemplateByEventUseCase(dependencies.ticketTemplateRepository);
  const deleteTicketTemplateUseCase = new DeleteTicketTemplateUseCase(dependencies.ticketTemplateRepository);

    /**
   * @openapi
   * /ticket-templates/event/{eventId}:
   *   get:
   *     tags:
   *       - Ticket Templates
   *     summary: Get ticket templates by event
   *     description: Get ticket templates by event
   *     parameters:
   *       - in: path
   *         name: eventId
   *         description: The ID of the event
   *         required: true
   *         schema:
   *           type: string
   *     security:
   *       - BearerAuth: []
   */
    router.get('/event/:eventId',
        basicLimiter,
        authenticate,
        authorize([UserRole.ADMIN]),
        async (req, res) => {
        try {
          const templates = await getTicketTemplateByEventUseCase.execute(req.params.eventId);
          httpResponses.ok(res, templates, 'Plantillas de tickets obtenidas exitosamente');
        } catch (error:any) {
          httpResponses.badRequest(res, error.message);
        }
      });

  /**
   * @openapi
   * /ticket-templates:
   *   post:
   *     tags:
   *       - Ticket Templates
   *     summary: Create a new ticket template
   *     security:
   *       - BearerAuth: []
   *     required:
   *       - name
   *       - description
   *       - price
   *       - maxQuantity
   *       - clientMinAge
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Entrada General"         
   *               description:
   *                 type: string
   *                 example: "Entrada General para el evento"
   *               price:
   *                 type: number
   *                 example: 1000
   *               maxQuantity:
   *                 type: number
   *                 example: 800
   *               clientMinAge:
   *                 type: number
   *                 example: 18
   *               isActive:
   *                 type: boolean
   *                 example: true
   */
  router.post('/', 
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      const template = await createTicketTemplateUseCase.execute(req.body);
       httpResponses.created(res, template, 'Plantilla de ticket creada exitosamente');
    } catch (error:any) {
       httpResponses.badRequest(res, error.message);
    }
  });


  /**
   * @openapi
   * /ticket-templates/{id}:
   *   put:
   *     tags:
   *       - Ticket Templates
   *     summary: Update a ticket template
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Entrada General"
   *               description:
   *                 type: string
   *                 example: "Entrada General para el evento"
   *               price:
   *                 type: number
   *                 example: 1000
   *               maxQuantity:
   *                 type: number
   *                 example: 800
   *               clientMinAge:
   *                 type: number
   *                 example: 18
   *               isActive:
   *                 type: boolean
   *                 example: true
   */
  router.put('/:id',
    basicLimiter,
    authenticate, 
    authorize([UserRole.ADMIN]),
     async (req, res) => {
    try {
      const template = await updateTicketTemplateUseCase.execute({
        ...req.body,
        id: req.params.id
      });
       httpResponses.ok(res, template, 'Plantilla de ticket actualizada exitosamente');
    } catch (error:any) {
       httpResponses.badRequest(res, error.message);
    }
  });

  /**
   * @openapi
   * /ticket-templates/{id}:
   *   delete:
   *     tags:
   *       - Ticket Templates
   *     summary: Delete a ticket template
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   */
  router.delete('/:id', 
    basicLimiter,
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
    try {
      await deleteTicketTemplateUseCase.execute(req.params.id);
       httpResponses.ok(res, null, 'Plantilla de ticket eliminada exitosamente');
    } catch (error:any) {
       httpResponses.badRequest(res, error.message);
    }
  });


  return router;
}; 