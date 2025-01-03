import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecoverPasswordUseCase } from '../../../application/use-cases/auth/RecoverPasswordUseCase';

describe('RecoverPasswordUseCase', () => {
  const mockUserRepository = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn()
  };

  const mockEmailService = {
    sendEmail: vi.fn()
  };

  const mockTokenRepository = {
    createToken: vi.fn(),
    findByToken: vi.fn(),
    delete: vi.fn(),
    findTokenByUserId: vi.fn(),
    deleteToken: vi.fn(),
    cleanExpiredTokens: vi.fn(),
    findTokenByToken: vi.fn()
  };

  const recoverPasswordUseCase = new RecoverPasswordUseCase({
    userRepository: mockUserRepository,
    emailService: mockEmailService,
    tokenRepository: mockTokenRepository
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send recovery email for existing user', async () => {
    const user = {
      _id: '123',
      email: 'test@example.com',
      name: 'Test User'
    };

    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockTokenRepository.createToken.mockResolvedValue({ token: 'test-token' });

    await recoverPasswordUseCase.execute('test@example.com');

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockEmailService.sendEmail).toHaveBeenCalled();
    expect(mockTokenRepository.createToken).toHaveBeenCalled();
  });

  it('should not throw error for non-existent user', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(recoverPasswordUseCase.execute('nonexistent@example.com'))
      .resolves
      .not
      .toThrow();

    expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
  });
}); 