import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/helper';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({
    title,
    price,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();
  return ticket;
};

it('fetches orders of a particular user', async () => {
  //create three tickets
  const ticketOne = await buildTicket('concert1', 10);
  const ticketTwo = await buildTicket('concert2', 20);
  const ticketThree = await buildTicket('concert3', 30);

  const cookieOne = getAuthCookie();
  const cookieTwo = getAuthCookie();

  //create one order as user #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', cookieOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  //create two orders as user #2, destructure the body and renaming them to orderOne and orderTwo
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookieTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookieTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  //Make request to get orders of user #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', cookieTwo)
    .expect(200);

  //Make sure we are only getting orders of user #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
