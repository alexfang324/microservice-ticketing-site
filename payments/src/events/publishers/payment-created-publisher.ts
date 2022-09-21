import { Publisher, PaymentCreatedEvent, Subjects } from '@afang324/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
