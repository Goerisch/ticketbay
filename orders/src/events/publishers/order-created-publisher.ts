import {Publisher, OrderCreatedEvent, Subjects} from '@dgticketbay/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
