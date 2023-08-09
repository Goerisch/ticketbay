import {natsWrapper} from '../../../nats-wrapper';
import {TicketUpdatedListener} from '../ticket-updated-listener';
import {TicketUpdatedEvent} from '@dgticketbay/common';
import {Ticket} from '../../../models/ticket';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Listener} from '../../../../../nats-test/src/events/abstract-listener';

const setup = async () => {
    //create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);
    //create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    });
    await ticket.save();
    //create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'elvis ressurection',
        price: 20,
        version: ticket.version + 1,
        userId: 'fakeUser',
    };
    //create a fake msg object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };
    //return everything
    return {msg, ticket, data, listener};
};

it('finds, updates and saves a ticket', async () => {
    const {msg, ticket, data, listener} = await setup();
    //call listener with data and msg
    await listener.onMessage(data, msg);
    //retrieve updated ticket from the db
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const {msg, data, listener} = await setup();
    //call listener with msg and data
    await listener.onMessage(data, msg);
    //expect ack
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has wrong version number', async () => {
    const {msg, data, listener} = await setup();
    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    } catch (error) {}
    expect(msg.ack).not.toHaveBeenCalled();
});
