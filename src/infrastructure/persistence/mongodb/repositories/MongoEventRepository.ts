import { IEventRepository } from "../../../../domain/repositories/IEventRepository";
import EventModel from "../schemas/EventSchema";
import { Event } from "../../../../domain/entities/Event";
import { EventDTO } from "../../../../application/dtos/EventDTO";
import mongoose from "mongoose";
export class MongoEventRepository implements IEventRepository {
    async create(event: Omit<EventDTO, "_id">): Promise<Event> {
        const createdEvent = await EventModel.create(event);
        return this.mapToEntity(createdEvent);
    }
    async update(id: string, event: EventDTO): Promise<Event> {
        const updatedEvent = await EventModel.findByIdAndUpdate(id, this.mapToModel(event), { new: true,ignoreUndefined:true });
        if (!updatedEvent) {
            throw new Error('No se encontró el evento a actualizar');
        }
        return this.mapToEntity(updatedEvent);
    }

    async delete(id: string): Promise<void> {
        const deletedEvent = await EventModel.findByIdAndDelete(id);
        if (!deletedEvent) {
            throw new Error('No se encontró el evento a eliminar');
        }
    }
    async list(): Promise<Event[]> {
        const events = await EventModel.find();
        return events.map(this.mapToEntity);
    }
    async findActiveEvents(): Promise<Event[]> {
        const events = await EventModel.find({ isActive: true });
        return events.map(this.mapToEntity);
    }
    async findById(id: string): Promise<Event | null> {
        const event = await EventModel.findById(id);
        return event ? this.mapToEntity(event) : null;
    }

    private mapToEntity(event: any): Event {
        return {
            ...event.toObject(),
            id: event._id.toString()
        };
    }

    private mapToModel(data:EventDTO): any {
        return {
            ...data,
            _id: data?.id,
            ticketTemplates: data?.ticketTemplates?.map((ticketTemplate) => new mongoose.Types.ObjectId(ticketTemplate))
        };
    }
}