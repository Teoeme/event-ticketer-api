import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { ValidationError, ValidationSchema, ValidationService } from '../../../domain/services/validation/ValidationService';

export class UpdateClientUseCase {
  private validationSchema:ValidationSchema<Partial<Client>> = {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 100
    },
    email: {
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: 'string',
      pattern: /^\+?[\d\s-]{9,}$/
    }
  };

  constructor(private clientRepository: IClientRepository) {}

  async execute(id: string, clientData: Partial<Client>): Promise<Client> {
    try {
      ValidationService.validate(clientData, this.validationSchema);

      // Verificar si el cliente existe
      const existingClient = await this.clientRepository.findById(id);
      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      // Si se está actualizando el email, verificar que no exista
      if (clientData.email && clientData.email !== existingClient.email) {
        const existingEmail = await this.clientRepository.findByEmail(clientData.email);
        if (existingEmail) {
          throw new Error('Ya existe un cliente con este email');
        }
      }

      return await this.clientRepository.update(id, clientData);
    } catch (error:any) {
      if(error instanceof ValidationError){
        throw new Error(Object.values(error.errors).join(', '));
      }
      throw new Error(`Error al actualizar el cliente: ${error.message}`);
    }
  }
} 