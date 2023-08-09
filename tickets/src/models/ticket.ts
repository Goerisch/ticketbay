import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

// Interface decribing the required properties for a new ticket
interface TicketProps {
    title: string;
    price: number;
    userId: string;
}

// Interface describing the properties of Ticket Model
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(props: TicketProps): TicketDoc;
}

// Interface describing the properties of a User Document
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
            versionKey: false,
        },
    },
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (props: TicketProps) => {
    return new Ticket(props);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export {Ticket};
