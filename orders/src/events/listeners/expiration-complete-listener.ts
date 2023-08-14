import {
    ExpirationCompleteEvent,
    Listener,
    OrderStatus,
    Subjects,
} from '@dgticketbay/common';
import {QUEUE_GROUP_NAME} from './queue-group-name';
import {Message} from 'node-nats-streaming';
import {Order} from '../../models/orders';
import {OrderCancelledPublisher} from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        //find expired order
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new Error('Order not found');
        }
        //return early if order has been paid for already
        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }
        //update status on order
        order.set({status: OrderStatus.Cancelled});
        //save order to db
        await order.save();
        //publish order-cancelled event
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {id: order.ticket.id},
        });
        //ack the message
        msg.ack();
    }
}
