import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateUserUseCase } from '../../../application/use-cases/user/CreateUserUseCase';
import { UserRole } from '../../../domain/value-objects/UserRole';
import { AuthProvider } from '../../../domain/value-objects/AuthProvider';

describe('CreateUserUseCase', () => {
  const mockUserRepository = {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn()
  };

  const createUserUseCase = new CreateUserUseCase({
    userRepository: mockUserRepository
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.OPERATOR,
      authProvider: AuthProvider.LOCAL,
      isActive: true
    };

    const createdUser = { ...userData, _id: '123' };
    mockUserRepository.create.mockResolvedValue(createdUser);
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await createUserUseCase.execute(userData);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(result).toEqual(createdUser);
  });

  it('should throw error if user email already exists', async () => {
    const userData = {
      name: 'Test User',
      email: 'existing@example.com',
      password: 'password123',
      role: UserRole.OPERATOR,
      authProvider: AuthProvider.LOCAL,
      isActive: true
    };

    mockUserRepository.findByEmail.mockResolvedValue({ ...userData, _id: '123' });

    await expect(createUserUseCase.execute(userData))
      .rejects
      .toThrow('Ya existe un usuario con este email');
  });
}); 