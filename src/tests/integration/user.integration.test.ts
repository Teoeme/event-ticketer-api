import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoUserRepository } from '../../infrastructure/persistence/mongodb/repositories/MongoUserRepository';
import { CreateUserUseCase } from '../../application/use-cases/user/CreateUserUseCase';
import { UserRole } from '../../domain/value-objects/UserRole';
import { AuthProvider } from '../../domain/value-objects/AuthProvider';
import { env } from '../../infrastructure/config/env';

describe('User Integration Tests', () => {
  let userRepository: MongoUserRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeAll(async () => {
    // Conectar a la base de datos de prueba
    await mongoose.connect(env.mongoUri, { dbName: `${env.appName.replace(/\s+/g, '-')}-test` });
    userRepository = new MongoUserRepository();
    createUserUseCase = new CreateUserUseCase({ userRepository });
  });

  beforeEach(async () => {
    // Limpiar la colección de usuarios antes de cada test
    await mongoose.connection.collection('users').deleteMany({});
  });

  afterAll(async () => {
    // Cerrar la conexión después de todos los tests
    await mongoose.connection.close();
  });

  it('should create and retrieve a user', async () => {
    // Crear usuario
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.OPERATOR,
      authProvider: AuthProvider.LOCAL,
      isActive: true
    };

    const createdUser = await createUserUseCase.execute(userData);

    // Verificar que el usuario fue creado
    expect(createdUser).toHaveProperty('_id');
    expect(createdUser.email).toBe(userData.email);

    // Recuperar usuario por email
    const foundUser = await userRepository.findByEmail(userData.email);
    expect(foundUser).not.toBeNull();
    expect(foundUser?.email).toBe(userData.email);
  });

  it('should handle complete user CRUD operations', async () => {
    // Create
    const userData = {
      name: 'CRUD Test User',
      email: 'crud@example.com',
      password: 'password123',
      role: UserRole.OPERATOR,
      authProvider: AuthProvider.LOCAL,
      isActive: true
    };

    const createdUser = await createUserUseCase.execute(userData);
    expect(createdUser).toHaveProperty('_id');

    // Read
    const foundUser = await userRepository.findById(createdUser._id);
    expect(foundUser).not.toBeNull();
    expect(foundUser?.email).toBe(userData.email);

    // Update
    const updatedData = { name: 'Updated Name' };
    const updatedUser = await userRepository.update(createdUser._id, updatedData);
    expect(updatedUser.name).toBe('Updated Name');

    // Delete
    await userRepository.delete(createdUser._id);
    const deletedUser = await userRepository.findById(createdUser._id);
    expect(deletedUser).toBeNull();
  });

  it('should handle concurrent user operations', async () => {
    // Crear múltiples usuarios concurrentemente
    const userPromises = Array.from({ length: 5 }, (_, i) => 
      createUserUseCase.execute({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: 'password123',
        role: UserRole.OPERATOR,
        authProvider: AuthProvider.LOCAL,
        isActive: true
      })
    );

    const users = await Promise.all(userPromises);
    expect(users).toHaveLength(5);

    // Verificar que todos los usuarios fueron creados
    const allUsers = await userRepository.list();
    expect(allUsers).toHaveLength(5);
  });

  it('should handle validation and constraints', async () => {
    // Crear usuario inicial
    const userData = {
      name: 'Duplicate Test',
      email: 'duplicate@example.com',
      password: 'password123',
      role: UserRole.OPERATOR,
      authProvider: AuthProvider.LOCAL,
      isActive: true
    };

    await createUserUseCase.execute(userData);
    // Intentar crear usuario con el mismo email
    await expect(createUserUseCase.execute(userData))
      .rejects
      .toThrow(/email/i);
  });
}); 