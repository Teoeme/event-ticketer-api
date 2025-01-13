export enum TicketEventType {
  CREADO = 'CREADO',
  CAMBIO_DE_ESTADO = 'CAMBIO_DE_ESTADO',
  VALIDADO = 'VALIDADO',
  ANULADO = 'ANULADO'
}

export interface TicketEvent {
  type: TicketEventType;
  timestamp: Date;
  previousStatus?: string;
  newStatus?: string;
  metadata?: Record<string, any>;
  userId?: string; // ID del usuario que realizó la acción
} 