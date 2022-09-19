import { isExternalModuleReference } from 'typescript';
import { Ticket } from '../tickets';

it('implements optimistic concurrency control', async () => {
  //create a ticket and save to db
  const ticket = Ticket.build({
    title: 'concert1',
    price: 10,
    userId: '123'
  });
  await ticket.save();

  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  //make change to both ticket instances
  firstInstance!.set({ price: 20 });
  secondInstance!.set({ price: 30 });

  //save both instance and expect the second one to return an error
  await firstInstance!.save();
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Second instance did not result in error');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert1',
    price: 10,
    userId: '123'
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
  await ticket.save();
  expect(ticket.version === 2).toBeFalsy();
});
