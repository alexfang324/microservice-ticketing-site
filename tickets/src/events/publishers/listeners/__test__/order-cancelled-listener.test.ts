import { OrderCancelledEvent } from '@afang324/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../../models/tickets';
import { natsWrapper } from '../../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert1',
    price: 10,
    userId: '1234'
  });
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { msg, data, ticket, orderId, listener };
};

it('updates the ticket', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('publishes the updated ticket', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  //compare the data published
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdatedData.orderId).not.toBeDefined();
  expect(ticketUpdatedData.version).toEqual(data.version + 1);
  expect(ticketUpdatedData.id).toEqual(data.ticket.id);
});

it('acks the event received', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
