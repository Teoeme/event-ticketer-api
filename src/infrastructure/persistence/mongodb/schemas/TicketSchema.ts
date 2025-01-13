import mongoose from "mongoose";
import { Ticket } from "../../../../domain/entities/Ticket";
import { TicketStatus } from "../../../../domain/value-objects/TicketStatus";
import { TicketEventType } from "../../../../domain/value-objects/TicketEvent";

const EntrySchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  location: { type: String, required: true },
  validatedBy: { type: String, required: true }
}, { _id: false });

const TicketEventSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: Object.values(TicketEventType)
  },
  timestamp: { 
    type: Date, 
    required: true 
  },
  previousStatus: { 
    type: String, 
    enum: Object.values(TicketStatus),
    required: false 
  },
  newStatus: { 
    type: String, 
    enum: Object.values(TicketStatus),
    required: false 
  },
  userId: { 
    type: String, 
    required: false,
    ref: 'User'
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed,
    required: false 
  }
}, { _id: false });

const TicketSchema = new mongoose.Schema({
    templateId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: 'TicketTemplate'
    },
    eventId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'Event' 
    },
    clientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'Client' 
    },
    token: { 
      type: String, 
      required: true,
      unique: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    purchaseDate: { 
      type: Date, 
      required: true 
    },
    issueDate: { 
      type: Date, 
      required: true 
    },
    status: { 
      type: String, 
      required: true, 
      enum: Object.values(TicketStatus), 
      default: TicketStatus.PENDIENTE 
    },
    entry: { 
      type: EntrySchema,
      required: false,
      default: null
    },
    history: {
      type: [TicketEventSchema],
      default: [],
      required: true
    }
}, {
    timestamps: true // Esto reemplaza createdAt y updatedAt
});

// Índices
if(!mongoose.models.Ticket){
    // TicketSchema.index({ token: 1 }, { unique: true });
    TicketSchema.index({ eventId: 1 });
    TicketSchema.index({ clientId: 1 });
    TicketSchema.index({ status: 1 });
    TicketSchema.index({ 'history.timestamp': 1 });
}

const TicketModel = mongoose.models.Ticket || mongoose.model<Ticket>('Ticket', TicketSchema);

export default TicketModel;