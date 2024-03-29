import {Subjects, Publisher, PaymentCreatedEvent} from '@dgticketbay/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
