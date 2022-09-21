import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus
} from '@afang324/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';
import { OrderUpdatedPublisher } from '../publishers/order-updated-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    await new OrderUpdatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status
    });

    msg.ack();
  }
}
