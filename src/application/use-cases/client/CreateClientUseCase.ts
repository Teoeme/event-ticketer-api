import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { ValidationError, ValidationSchema, ValidationService } from '../../../domain/services/validation/ValidationService';

export class CreateClientUseCase {
  private validationSchema: ValidationSchema<Omit<Client, "id" | "updatedAt" | "createdAt">> = {
    name: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 100
    },
    documentId: {
      required: true,
      type: 'string',
      custom: (value: string) => {
        // Aquí puedes agregar validación específica del DNI
        return /^\d{8}[A-Z]?$/.test(value) || 'Formato de DNI inválido';
      }
    },
    email: {
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email inválido'
    },
    phone: {
      type: 'string',
      pattern: /^\+?[\d\s-]{9,}$/,
      message: 'Formato de teléfono inválido'
    },
    birthDate: {
      type: 'date',
      custom: (value: Date) => {
        const age = (new Date().getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24 * 365);
        return age >= 18 || 'El cliente debe ser mayor de edad';
      }
    }
  };

  constructor(private clientRepository: IClientRepository) {}

  async execute(clientData: Omit<Client, "id" | "updatedAt" | "createdAt">): Promise<Client> {
    try {
      ValidationService.validate(clientData, this.validationSchema);

      // Verificar si ya existe un cliente con el mismo DNI
      const existingClient = await this.clientRepository.findByDocumentId(clientData.documentId);
      if (existingClient) {
        throw new Error('Ya existe un cliente con este DNI');
      }

      // Verificar si ya existe un cliente con el mismo email (si se proporciona)
      if (clientData.email) {
        const existingEmail = await this.clientRepository.findByEmail(clientData.email);
        if (existingEmail) {
          throw new Error('Ya existe un cliente con este email');
        }
      }

      return await this.clientRepository.create(clientData);
    } catch (error:any) {
        if(error instanceof ValidationError){
            throw new Error(Object.values(error.errors).join(', '));
        }
      throw new Error(`Error al crear el cliente: ${error.message}`);
    }
  }
} 