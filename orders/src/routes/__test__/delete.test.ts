import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/helper';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error when the order id does not exist', async () => {
  await request(app)
    .patch(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set('Cookie', getAuthCookie())
    .send()
    .expect(404);
});

it('return an error when an user try to the order of another user', async () => {
  //create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  //create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  //delete an order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', getAuthCookie())
    .send()
    .expect(401);
});

it('can mark an order as cancelled', async () => {
  //create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  const cookie = getAuthCookie();

  //create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  //delete an order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  //check order status has been updated to cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  //create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  const cookie = getAuthCookie();

  //create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  //delete an order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
