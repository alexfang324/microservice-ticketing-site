import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Ticket } from '../../../models/ticket';
import { Order, OrderStatus } from '../../../models/order';
import { ExpirationCompleteEvent } from '@afang324/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  //create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'conert1',
    price: 10
  });
  await ticket.save();

  //create an order
  const order = Order.build({
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  //create fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return { listener, ticket, order, data, msg };
};

it('updates order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
