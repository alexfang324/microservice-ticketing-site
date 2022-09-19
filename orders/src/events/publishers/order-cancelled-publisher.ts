import { Publisher, OrderCancelledEvent, Subjects } from '@afang324/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
