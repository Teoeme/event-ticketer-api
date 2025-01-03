export interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  maxQuantity: number;
  clientMinAge: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 