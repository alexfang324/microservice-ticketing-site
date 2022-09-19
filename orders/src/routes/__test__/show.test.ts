import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/helper';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('returns an error when the order id does not exist', async () => {
  await request(app)
    .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set('Cookie', getAuthCookie())
    .send()
    .expect(404);
});

it('it fetches the order', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  const cookie = getAuthCookie();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error when one user tries fetch order of another user', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  const cookie = getAuthCookie();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const cookieTwo = getAuthCookie();
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookieTwo)
    .send()
    .expect(401);
});
