import { Listener, OrderCreatedEvent, Subjects } from '@afang324/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../../models/tickets';
import { TicketUpdatedPublisher } from '../ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('No ticket found');
    }

    ticket.set({ orderId: data.id });
    await ticket.save();

    //publish updated ticket to other services
    await new TicketUpdatedPublisher(this.client).publish(ticket.toJSON());

    msg.ack();
  }
}
