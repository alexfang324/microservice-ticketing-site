import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/helper';
import { Order } from '../../models/order';
import { OrderStatus } from '@afang324/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', getAuthCookie())
    .send({
      token: '123456',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', getAuthCookie())
    .send({
      token: '123456',
      orderId: order.id
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', getAuthCookie(userId))
    .send({
      token: '123456',
      orderId: order.id
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  });
  await order.save();

  //make a request with random price amount
  await request(app)
    .post('/api/payments')
    .set('Cookie', getAuthCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  //retrieve recent transactions from stripe and confirm the request went through
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  //make sure payment is saved to DB
  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });
  expect(payment).not.toBeNull();
});

it('publishes an event', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  });
  await order.save();

  //make a request with random price amount
  await request(app)
    .post('/api/payments')
    .set('Cookie', getAuthCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  // find payment from DB
  const payment = await Payment.findOne({
    orderId: order.id
  });

  //make sure event has been published correctly
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(payment!.id);
  expect(eventData.version).toEqual(payment!.version);
  expect(eventData.orderId).toEqual(payment!.orderId);
  expect(eventData.stripeId).toEqual(payment!.stripeId);
});
