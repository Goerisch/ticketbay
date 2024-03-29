import {Publisher, OrderCancelledEvent, Subjects} from '@dgticketbay/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
