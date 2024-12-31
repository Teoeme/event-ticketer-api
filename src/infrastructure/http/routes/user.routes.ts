import { Router } from "express";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { CreateUserUseCase } from "../../../application/use-cases/user/CreateUserUseCase";
import { GetUserByIdUseCase } from "../../../application/use-cases/user/GetUserByIdUseCase";
import { UpdateUserUseCase } from "../../../application/use-cases/user/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../../application/use-cases/user/DeleteUserUseCase";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../domain/value-objects/UserRole";
import { httpResponses } from "../responses/httpResponse";

export const createUserRouter = (dependencies: {
  userRepository: IUserRepository;
}) => {
  const router = Router();
  
  // Inicializar casos de uso
  const createUserUseCase = new CreateUserUseCase({
    userRepository: dependencies.userRepository
  });
  const getUserByIdUseCase = new GetUserByIdUseCase({
    userRepository: dependencies.userRepository
  });
  const updateUserUseCase = new UpdateUserUseCase({
    userRepository: dependencies.userRepository
  });
  const deleteUserUseCase = new DeleteUserUseCase({
    userRepository: dependencies.userRepository
  });

  /**
   * @openapi
   * /users:
   *   post:
   *     tags:
   *       - Users
   *     summary: Create a new user
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
   *               - email
   *               - password
   *               - role
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [ADMIN, OPERATOR, SUPERVISOR]
   */
  router.post('/',
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
      try {
        const user = await createUserUseCase.execute(req.body);
        httpResponses.created(res,user,'Usuario creado correctamente')
      } catch (error:any) {
        httpResponses.badRequest(res,error.message)
      }
    }
  );

  /**
   * @openapi
   * /users:
   *   get:
   *     tags:
   *       - Users
   *     summary: Get all users
   *     security:
   *       - bearerAuth: []
   */
  router.get('/',
    authenticate,
    authorize([UserRole.ADMIN, UserRole.SUPERVISOR]),
    async (req, res) => {
      try {
        const users = await dependencies.userRepository.list();
        httpResponses.ok(res,users,'Usuarios listados correctamente')
      } catch (error:any) {
        httpResponses.serverError(res,error.message)
      }
    }
  );

  /**
   * @openapi
   * /users/{id}:
   *   get:
   *     tags:
   *       - Users
   *     summary: Get user by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   */
  router.get('/:id',
    authenticate,
    authorize([UserRole.ADMIN, UserRole.SUPERVISOR]),
    async (req, res) => {
      try {
        const user = await getUserByIdUseCase.execute(req.params.id);
        if (!user) {
          httpResponses.notFound(res,'Usuario no encontrado')
        }
        httpResponses.ok(res,user,'Usuario encontrado correctamente')
      } catch (error:any) {
        httpResponses.serverError(res,error.message)
      }
    }
  );

  /**
   * @openapi
   * /users/{id}:
   *   put:
   *     tags:
   *       - Users
   *     summary: Update user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   */
  router.put('/:id',
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
      try {
        const user = await updateUserUseCase.execute(req.params.id, req.body);
        httpResponses.ok(res,user,'Usuario actualizado correctamente')
      } catch (error:any) {
        httpResponses.badRequest(res,error.message)
      }
    }
  );

  /**
   * @openapi
   * /users/{id}:
   *   delete:
   *     tags:
   *       - Users
   *     summary: Delete user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   */
  router.delete('/:id',
    authenticate,
    authorize([UserRole.ADMIN]),
    async (req, res) => {
      try {
        await deleteUserUseCase.execute(req.params.id);
        httpResponses.ok(res,'Usuario eliminado correctamente')
      } catch (error:any) {
        httpResponses.serverError(res,error.message)
      }
    }
  );

  return router;
};