import {Listener, OrderCancelledEvent, Subjects} from '@dgticketbay/common';
import {QUEUE_GROUP_NAME} from './queue-group-name';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../models/ticket';
import {TicketUpdatedPublisher} from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        //find the ticket the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
        //error if there is no ticket
        if (!ticket) {
            throw new Error('ticket not found');
        }
        //mark ticket as not longer being reserved by deleting orderId
        ticket.set({orderId: undefined});
        //save Ticket
        await ticket.save();
        //publish event for updated ticket
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId,
        });
        //ack the message
        msg.ack();
    }
}
