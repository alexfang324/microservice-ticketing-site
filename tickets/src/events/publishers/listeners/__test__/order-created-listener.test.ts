import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../../nats-wrapper';
import { Ticket } from '../../../../models/tickets';
import { OrderCreatedEvent, OrderStatus, Subjects } from '@afang324/common';
import mongoose, { Mongoose } from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  //create an instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //create an save a ticket to db
  const ticket = Ticket.build({
    title: 'concert1',
    price: 10,
    userId: '1234'
  });
  await ticket.save();

  //create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: '5678',
    expiresAt: '100000',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  //create the fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { data, ticket, listener, msg };
};

it('sets the orderId of the ticket', async () => {
  const { data, ticket, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { data, ticket, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { data, ticket, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  //compare the data published
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdatedData.orderId).toEqual(data.id);
  expect(ticketUpdatedData.version).toEqual(data.version + 1);
  expect(ticketUpdatedData.id).toEqual(data.ticket.id);
  expect(ticketUpdatedData.price).toEqual(data.ticket.price);
});
