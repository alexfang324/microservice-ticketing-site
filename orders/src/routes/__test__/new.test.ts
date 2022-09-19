import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { getAuthCookie } from '../../test/helper';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('return an error a ticket is not provided', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({})
    .expect(400);
});

it('return an error if the ticket provided does not exit', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId })
    .expect(404);
});

it('return an error if user is not authorized', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .send({ ticketId: ticket.id })
    .expect(401);
});

it('return an error if ticket is already reserved', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  const order = Order.build({
    userId: '123456',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('created an order and reserved a ticket', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(response.body.status).toEqual(OrderStatus.Created);

  //compare ticket content
  expect(response.body.ticket.id).toEqual(ticket.id);
  expect(response.body.ticket.title).toEqual(ticket.title);
  expect(response.body.ticket.price).toEqual(ticket.price);

  const now = new Date();
  const expiration = now.setSeconds(
    now.getSeconds() + parseInt(process.env.EXPIRATION_WINDOW_SECONDS!)
  );
  expect(Date.parse(response.body.expiresAt)).toBeLessThanOrEqual(expiration);
});

it('emits an order:created event', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
