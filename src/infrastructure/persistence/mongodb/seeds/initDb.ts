import { MongoUserRepository } from '../repositories/MongoUserRepository';
import { UserRole } from '../../../../domain/value-objects/UserRole';
import { AuthProvider } from '../../../../domain/value-objects/AuthProvider';
import bcrypt from 'bcrypt';
import { env } from '../../../config/env';
import { v4 as uuid } from 'uuid';
export const initializeDatabase = async (userRepository: MongoUserRepository) => {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await userRepository.findByEmail('super@admin.com');
    
    if (!existingAdmin) {
      // Crear usuario admin por defecto
      const hashedPassword = await bcrypt.hash(env.superAdminPassword, 10);
      
      await userRepository.create({
        name: 'Super Admin',
        email: 'super@admin.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        authProvider: AuthProvider.LOCAL,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Super Admin user creado');
    }
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
  }
}; 