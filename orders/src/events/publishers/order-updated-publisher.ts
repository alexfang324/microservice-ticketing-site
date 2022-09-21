import { Publisher, OrderUpdatedEvent, Subjects } from '@afang324/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}
