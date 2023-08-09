import mongoose from 'mongoose';
import {TicketCreatedEvent} from '@dgticketbay/common';
import {TicketCreatedListener} from '../ticket-created-listener';
import {natsWrapper} from '../../../nats-wrapper';
import {Message} from 'node-nats-streaming';
import {Ticket} from '../../../models/ticket';

const setup = async () => {
    //create instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    //create fake data event
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };
    //create fake message-object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {listener, data, msg};
};

it('creates and saves a ticket', async () => {
    const {listener, data, msg} = await setup();
    //call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    //assert the ticket was created
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();
    //call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    //assert the ack function has been called
    expect(msg.ack).toHaveBeenCalled();
});
