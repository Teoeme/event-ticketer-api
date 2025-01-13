import { TicketTemplate } from "./TicketTemplate";

export interface Event {
  id?: string;
  name: string;
  description: string;
  date: Date;
  startTime: Date; //timestamps
  endTime: Date; //timestamps
  location: string;
  capacity: number;
  ticketTemplates: (TicketTemplate | string)[];
  isActive: boolean;
  tokenSecret: string; // Secreto único por evento
} 