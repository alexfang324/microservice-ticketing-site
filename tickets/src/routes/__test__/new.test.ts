import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/helper';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post request', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('returns 401 when user is not signed in', async () => {
  const response = await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('it returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({
      title: '',
      price: 10
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({
      price: 10
    })
    .expect(400);
});

it('it returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({
      title: 'ticketName',
      price: -2
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({
      title: 'ticketName'
    })
    .expect(400);
});

it('it creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({
      title: 'ticketName',
      price: 20
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual('ticketName');
  expect(tickets[0].price).toEqual(20);
});

it('publishes an event', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({
      title: 'ticketName',
      price: 20
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
