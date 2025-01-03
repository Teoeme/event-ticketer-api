export type ValidationRule<T> = {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any, object: T) => boolean | string;
    message?: string;
    notAllowed?: boolean;
};

export type ValidationSchema<T> = {
    [K in keyof T]?: ValidationRule<T>;
};

export class ValidationError extends Error {
    constructor(public errors: Record<string, string>) {
        super('Error de validación');
        this.name = 'ValidationError';
    }
}

export class ValidationService {
    static validate<T extends object>(data: T, schema: ValidationSchema<T>): void {
        const errors: Record<string, string> = {};

        for (const rule of Object.entries(schema)) {
            const field = rule[0]
            const rules = rule[1] as ValidationRule<T>
            const value = data[field as keyof T];

            //Campo no permitido
            if (rules.notAllowed) {
                if (value !== undefined) {
                    errors[field] =  `El campo ${field} no está permitido`;
                    continue;
                }
            }   

            // Validación de campo requerido
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors[field] = `El campo ${field} es requerido`;
                continue;
            }

            // Si el campo no es requerido y está vacío, saltamos el resto de validaciones
            if (!rules.required && (value === undefined || value === null || value === '')) {
                continue;
            }

            // Validación de tipo
            if (rules.type && !this.validateType(value, rules.type)) {
                errors[field] = `El campo ${field} debe ser de tipo ${rules.type}`;
                continue;
            }

            // Validación de longitud para strings y arrays
            if (typeof value === 'string' || Array.isArray(value)) {
                if (rules.minLength !== undefined && value.length < rules.minLength) {
                    errors[field] = 
                        `El campo ${field} debe tener al menos ${rules.minLength} caracteres`;
                }
                if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                    errors[field] = 
                        `El campo ${field} debe tener máximo ${rules.maxLength} caracteres`;
                }
            }

            // Validación de rango para números
            if (typeof value === 'number') {
                if (rules.min !== undefined && value < rules.min) {
                    errors[field] = 
                        `El campo ${field} debe ser mayor o igual a ${rules.min}`;
                }
                if (rules.max !== undefined && value > rules.max) {
                    errors[field] = 
                        `El campo ${field} debe ser menor o igual a ${rules.max}`;
                }
            }

            // Validación de patrón
            if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                errors[field] = 
                    `El campo ${field} no cumple con el formato requerido`;
            }

            // Validación de enum
            if (rules.enum && !rules.enum.includes(value)) {
                errors[field] = 
                    `El campo ${field} debe ser uno de: ${rules.enum.join(', ')}`;
            }

            // Validación personalizada
            if (rules.custom) {
                const result = rules.custom(value, data);
                if (result !== true) {
                    errors[field] = typeof result === 'string' ? result :
                        rules.message || `El campo ${field} no cumple con la validación personalizada`;
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors);
        }
    }

    private static validateType(value: any, type: string): boolean {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'date':
                return value instanceof Date && !isNaN(value.getTime());
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                return false;
        }
    }
} 