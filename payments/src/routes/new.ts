import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus
} from '@afang324/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('Token is not provided'),
    body('orderId').not().isEmpty().withMessage('OrderId is not provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    //find the order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }

    //check the payee owns the order
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    //make sure the order hasn't already been cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order has already been cancelled');
    }

    //charge the user using Stripe
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token
    });

    //save charge to DB
    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    });
    await payment.save();

    //publish payment:created event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      version: payment.version,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
