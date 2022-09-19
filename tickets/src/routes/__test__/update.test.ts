import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/helper';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/tickets';

it('returns 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', getAuthCookie())
    .send({
      title: 'ticketName',
      price: 10
    })
    .expect(404);
});

it('returns 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'ticketName',
      price: 10
    })
    .expect(401);
});

it('returns 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({
      title: 'ticketName',
      price: 10
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', getAuthCookie())
    .send({
      title: 'ticketName2',
      price: 20
    })
    .expect(401);
});

it('returns 400 if the user provide an invalid title or price', async () => {
  const cookie = getAuthCookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'ticketName',
      price: 10
    });

  //PUT with empty title
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 10
    })
    .expect(400);

  //PUT with no title
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 10
    })
    .expect(400);

  //PUT with invalid price
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'ticketName',
      price: -1
    })
    .expect(400);
});

it('it updates the ticket when valid inputs are provided', async () => {
  const cookie = getAuthCookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'ticketName',
      price: 10
    });

  const newResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'ticketName2',
      price: 20
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.id).toEqual(response.body.id);
  expect(ticketResponse.body.title).toEqual('ticketName2');
  expect(ticketResponse.body.price).toEqual(20);
});

it('publishes an event', async () => {
  const cookie = getAuthCookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'ticketName',
      price: 10
    });

  const newResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'ticketName2',
      price: 20
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if the ticket is reserved/ordered', async () => {
  const cookie = getAuthCookie();

  //create a ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'ticketName',
      price: 10
    });

  //manually reserve the ticket by adding an orderId to the ticket in db
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  //make a request to change ticket that has been reservered
  const newResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'ticketName2',
      price: 20
    })
    .expect(400);
});
