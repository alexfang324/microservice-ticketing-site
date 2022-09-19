import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/helper';
import mongoose from 'mongoose';

const createTicket = (title: string, price: number) => {
  return request(app).post('/api/tickets').set('Cookie', getAuthCookie()).send({
    title,
    price
  });
};

it('it can fetch a list of tickets', async () => {
  await createTicket('ticketName1', 10);
  await createTicket('ticketName2', 20);
  await createTicket('ticketName3', 30);

  const response = await request(app).get('/api/tickets').send().expect(200);
  expect(response.body.length).toEqual(3);
});
