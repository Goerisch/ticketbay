import {Publisher, TicketUpdatedEvent, Subjects} from '@dgticketbay/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
