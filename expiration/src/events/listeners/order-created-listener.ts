import {Listener, OrderCreatedEvent, Subjects} from '@dgticketbay/common';
import {QUEUE_GROUP_NAME} from './queue-group-name';
import {Message} from 'node-nats-streaming';
import {expirationQueue} from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(`Waiting ${delay} milliseconds to process the event`);
        await expirationQueue.add({orderId: data.id}, {delay});
        msg.ack();
    }
}
