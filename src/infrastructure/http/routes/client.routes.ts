import { Router } from "express";
import { IClientRepository } from "../../../domain/repositories/IClientRepository";
import { authenticate } from '../middlewares/auth.middleware';
import { CreateClientUseCase } from '../../../application/use-cases/client/CreateClientUseCase';
import { UpdateClientUseCase } from '../../../application/use-cases/client/UpdateClientUseCase';
import { httpResponses } from '../responses/httpResponse';

export const createClientRouter = (dependencies: {
    clientRepository: IClientRepository;
}) => {
    const router = Router();

    const createClientUseCase = new CreateClientUseCase(dependencies.clientRepository);
    const updateClientUseCase = new UpdateClientUseCase(dependencies.clientRepository);

    // Crear cliente
    /**
     * @openapi
     * /clients:
     *   post:
     *     summary: Create a client
     *     tags: [Clients]
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
     *               - documentId
     *               - birthDate
     *             properties:
     *               name:
     *                 type: string
     *                 description: Client name
     *                 example: Juan Perez
     *               documentId:
     *                 type: string
     *                 description: Client documentId
     *                 example: 12345678
     *               birthDate:
     *                 type: string
     *                 description: Client birthDate
     *                 example: 1990-01-01
     *               email:
     *                 type: string
     *                 description: Client email
     *                 example: juanperez@gmail.com
     *               phone:
     *                 type: string
     *                 description: Client phone
     *                 example: +5491133333333
     */
    router.post('/', authenticate, async (req, res) => {
        try {
            const client = await createClientUseCase.execute(req.body);
            httpResponses.created(res, client, 'Cliente creado exitosamente');
        } catch (error: any) {
            httpResponses.badRequest(res, error.message);
        }
    });

    // Actualizar cliente
    router.put('/:id', authenticate, async (req, res) => {
        try {
            const client = await updateClientUseCase.execute(req.params.id, req.body);
            httpResponses.ok(res, client, 'Cliente actualizado exitosamente');
        } catch (error: any) {
            httpResponses.badRequest(res, error.message);
        }
    });

    // Obtener cliente por ID
    router.get('/:id', authenticate, async (req, res) => {
        try {
            const client = await dependencies.clientRepository.findById(req.params.id);
            if (!client) {
                httpResponses.notFound(res, 'Cliente no encontrado');
            }
            httpResponses.ok(res, client);
        } catch (error: any) {
            httpResponses.serverError(res, error.message);
        }
    });

    // Search client by documentId
    /**
     * @openapi
     * /clients/search/dni/{documentId}:
     *   get:
     *     summary: Search client by documentId
     *     tags: [Clients]
     *     security:
     *       - bearerAuth: []
     */
    router.get('/search/dni/:documentId', authenticate, async (req, res) => {
        try {
            const client = await dependencies.clientRepository.findByDocumentId(req.params.documentId);
            if (!client) {
                httpResponses.notFound(res, 'Cliente no encontrado');
                return
            }
            httpResponses.ok(res, client);
        } catch (error: any) {
            httpResponses.serverError(res, error.message);
        }
    });

    // Listar todos los clientes
    /**
     * @openapi
     * /clients:
     *   get:
     *     summary: Get all clients
     *     tags: [Clients]
     *     security:
     *       - bearerAuth: []
     */ 
    router.get('/', authenticate, async (req, res) => {
        try {
            const clients = await dependencies.clientRepository.list();
            httpResponses.ok(res, clients);
        } catch (error: any) {
            httpResponses.serverError(res, error.message);
        }
    });

    // Eliminar cliente
    router.delete('/:id', authenticate, async (req, res) => {
        try {
            await dependencies.clientRepository.delete(req.params.id);
            httpResponses.ok(res, null, 'Cliente eliminado exitosamente');
        } catch (error: any) {
            httpResponses.serverError(res, error.message);
        }
    });

    return router;
};