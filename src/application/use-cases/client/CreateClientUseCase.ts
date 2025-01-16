import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { ValidationError, ValidationSchema, ValidationService } from '../../../domain/services/validation/ValidationService';

export class CreateClientUseCase {
  private validationSchema: ValidationSchema<Omit<Client, "id" | "updatedAt" | "createdAt">> = {
    name: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 100,
      message:"Debe especificar un nombre para el cliente"
    },
    documentId: {
      required: true,
      type: 'string',
      custom: (value: string) => {
        // Validación del DNI: debe tener 7 u 8 dígitos
        return /^\d{7,8}$/.test(value);
      },
      message:"Debe especificar un DNI para el cliente"
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
      message:"Debe especificar una fecha de nacimiento para el cliente",
      required:true
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