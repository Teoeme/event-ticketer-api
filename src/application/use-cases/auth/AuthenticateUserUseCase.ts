import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthProvider } from '../../../domain/value-objects/AuthProvider';

interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private dependencies: { userRepository: IUserRepository, jwtSecret: string }
  ) {}

  async execute(email: string, password: string, authProvider: AuthProvider=AuthProvider.LOCAL): Promise<AuthResponse> {
    let user: User;
    switch(authProvider){
      case AuthProvider.LOCAL:
        user = await this.authenticateWithLocal(email, password);
        break;
      case AuthProvider.GOOGLE:
        user = await this.authenticateWithGoogle(email);
        break;
      default:
        throw new Error('Proveedor de autenticación no soportado');
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role 
      },
      this.dependencies.jwtSecret,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async authenticateWithGoogle(email: string): Promise<User>{
    const user = await this.dependencies.userRepository.findByEmail(email);
    if(!user){
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async authenticateWithLocal(email: string, password: string): Promise<User>{
    const user = await this.dependencies.userRepository.findByEmail(email);
    
    if (!user || !user.password) {
      throw new Error('Credenciales invalidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Credenciales invalidas');
    }

    return user;
  }
} 