import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/helper';
import mongoose from 'mongoose';

it('returns 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const responses = await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns ticket if the ticket is found', async () => {
  const title = 'ticketName';
  const price = 10;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);
  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
