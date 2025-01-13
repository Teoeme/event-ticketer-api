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
     *     summary: Crear un cliente
     *     tags: [Clientes]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Client'
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

    // Buscar cliente por DNI
    router.get('/search/dni/:documentId', authenticate, async (req, res) => {
        try {
            const client = await dependencies.clientRepository.findByDocumentId(req.params.documentId);
            if (!client) {
             httpResponses.notFound(res, 'Cliente no encontrado');
            }
            httpResponses.ok(res, client);
        } catch (error: any) {
            httpResponses.serverError(res, error.message);
        }
    });

    // Listar todos los clientes
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