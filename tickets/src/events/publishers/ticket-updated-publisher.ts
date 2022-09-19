import { Publisher, Subjects, TicketUpdatedEvent } from '@afang324/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
