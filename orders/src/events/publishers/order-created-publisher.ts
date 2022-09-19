import { Publisher, OrderCreatedEvent, Subjects } from '@afang324/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
