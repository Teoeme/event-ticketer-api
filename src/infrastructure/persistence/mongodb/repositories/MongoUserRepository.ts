import { User } from '../../../../domain/entities/User';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { UserModel } from '../schemas/UserSchema';

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(id);
      return user ? user.toObject() : null;
    } catch (error) {
      throw new Error(`Error al buscar el usuario: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user ? user.toObject() : null;
    } catch (error) {
      throw new Error(`Error al buscar el usuario por email: ${error}`);
    }
  }

  async create(userData:Omit<User, '_id'>): Promise<User> {
    try {
      const user = new UserModel(userData);
      await user.save();
      return user.toObject();
    } catch (error) {
      throw new Error(`Error al crear el usuario: ${error}`);
    }
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { ...userData, updatedAt: new Date() },
        { new: true }
      );

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user.toObject();
    } catch (error) {
      throw new Error(`Error al actualizar el usuario: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await UserModel.findByIdAndDelete(id);
      if (!result) {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      throw new Error(`Error al eliminar el usuario: ${error}`);
    }
  }

  async list(): Promise<User[]> {
    try {
      const users = await UserModel.find();
      return users.map(user => user.toObject());
    } catch (error) {
      throw new Error(`Error al listar los usuarios: ${error}`);
    }
  }
} 