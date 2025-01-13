import mongoose from "mongoose";
import { Event } from '../../../../domain/entities/Event';
const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    ticketTemplates: { type: [mongoose.Schema.Types.ObjectId], ref: 'TicketTemplate', required: true },
    isActive: { type: Boolean, required: true, default: true },
    secret: { type: String, required: true }
});

const EventModel = mongoose.models.Event || mongoose.model<Event>('Event', EventSchema);

export default EventModel;