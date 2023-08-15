import {
    Listener,
    OrderCancelledEvent,
    OrderStatus,
    Subjects,
} from '@dgticketbay/common';
import {QUEUE_GROUP_NAME} from './queue-group-name';
import {Message} from 'node-nats-streaming';
import {Order} from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findByEvent({
            id: data.id,
            version: data.version,
        });

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({status: OrderStatus.Cancelled});
        await order.save();

        msg.ack();
    }
}