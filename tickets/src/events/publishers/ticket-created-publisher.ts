import {Publisher, TicketCreatedEvent, Subjects} from '@dgticketbay/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
