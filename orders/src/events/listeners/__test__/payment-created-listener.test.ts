import { OrderStatus, PaymentCreatedEvent } from '@afang324/common';
import { natsWrapper } from '../../../nats-wrapper';
import { PaymentCreatedListener } from '../payment-created-listener';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //create a listener
  const listener = new PaymentCreatedListener(natsWrapper.client);

  //create and save an order
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'ticket1',
    price: 10
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  //create fake data object
  const data: PaymentCreatedEvent['data'] = {
    id: order.id,
    version: 0,
    orderId: order.id,
    stripeId: '123456'
  };

  //create fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, order, msg };
};

it('updates the order status', async () => {
  const { listener, data, order, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.orderId);
  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});

it('acks the message', async () => {
  const { listener, data, order, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes an order:updated event', async () => {
  const { listener, data, order, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
  expect(eventData.version).toEqual(order.version + 1);
  expect(eventData.status).toEqual(OrderStatus.Complete);
});
