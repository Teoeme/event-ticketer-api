import mongoose from "mongoose";
import { TicketTemplateDTO } from "../../../../application/dtos/TicketTemplateDTO";
import { TicketTemplate } from "../../../../domain/entities/TicketTemplate";
import { ITicketTemplateRepository } from "../../../../domain/repositories/ITicketTemplateRepository";
import TicketTemplateModel from "../schemas/TicketTemplateSchema";
import EventModel from "../schemas/EventSchema";

export class MongoTicketTemplateRepository implements ITicketTemplateRepository {
    
    async findById(id: string): Promise<TicketTemplate | null> {
        const ticketTemplate = await TicketTemplateModel.findById( new mongoose.Types.ObjectId(id));
        return ticketTemplate ? this.mapToEntity(ticketTemplate) : null;
    }

    async findByEventId(eventId: string): Promise<TicketTemplate[] | null> {
        const event = await EventModel.findById(new mongoose.Types.ObjectId(eventId));
        if (!event) {
            throw new Error('No se encontró el evento');
        }
        console.log(event.ticketTemplates,'Event tickets');
        const ticketTemplates = await Promise.all(event.ticketTemplates.map(async (ticketTemplateId:string) => {
            return await TicketTemplateModel.findById(ticketTemplateId);
        }));
        return ticketTemplates.map(this.mapToEntity);
    }

    async create(ticketTemplate: TicketTemplate): Promise<TicketTemplate> {
        const createdTicketTemplate = await TicketTemplateModel.create(ticketTemplate);
        return this.mapToEntity(createdTicketTemplate);
    }

    async update(ticketTemplate: TicketTemplate): Promise<TicketTemplate> {
        const updatedTicketTemplate = await TicketTemplateModel.findByIdAndUpdate(ticketTemplate.id, ticketTemplate,{new: true});
        if (!updatedTicketTemplate) {
            throw new Error('No se encontró la plantilla de ticket a editar');
        }
        return this.mapToEntity(updatedTicketTemplate);
    }

    async delete(id: string): Promise<void> {
        const deletedTicketTemplate = await TicketTemplateModel.findByIdAndDelete(id);
        if (!deletedTicketTemplate) {
            throw new Error('No se encontró la plantilla de ticket a eliminar');
        }
    }

    private mapToEntity(ticketTemplate: any): TicketTemplate {
        return {
            ...ticketTemplate.toObject(),
            id: ticketTemplate._id.toString()
        };
    }

    private mapToModel(data:TicketTemplateDTO): any {
        return {
            ...data,
            _id: new mongoose.Types.ObjectId(data?.id)
        };
    }

   
}