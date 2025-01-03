import { TicketTemplateDTO } from "./TicketTemplateDTO";

export interface EventDTO {
    id: string;
    name: string;
    description: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    location: string;
    capacity: number;
    ticketTemplates: string[];
    isActive: boolean;
}