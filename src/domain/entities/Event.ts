import { TicketTemplate } from "./TicketTemplate";

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  ticketTemplates: TicketTemplate[];
  isActive: boolean;
} 