import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticateUserUseCase } from '../../../application/use-cases/auth/AuthenticateUserUseCase';
import { AuthProvider } from '../../../domain/value-objects/AuthProvider';
import bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn()
  }
}));

describe('AuthenticateUserUseCase', () => {
  const mockUserRepository = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn()
  };

  const authenticateUseCase = new AuthenticateUserUseCase({
    userRepository: mockUserRepository,
    jwtSecret: 'test-secret'
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should authenticate user with valid credentials', async () => {
    const user = {
      _id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      authProvider: AuthProvider.LOCAL
    };

    mockUserRepository.findByEmail.mockResolvedValue(user);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authenticateUseCase.execute(
      'test@example.com',
      'password123'
    );

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw error with invalid credentials', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(authenticateUseCase.execute(
      'nonexistent@example.com',
      'password123'
    )).rejects.toThrow('Credenciales invalidas');
  });
});