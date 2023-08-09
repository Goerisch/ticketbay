import {OrderCancelledEvent, OrderStatus} from '@dgticketbay/common';
import {Ticket} from '../../../models/ticket';
import {natsWrapper} from '../../../nats-wrapper';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {OrderCancelledListener} from '../order-cancelled-listener';

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 22,
        userId: 'fakeUser',
    });
    const orderId = new mongoose.Types.ObjectId().toHexString();
    ticket.set({orderId});
    await ticket.save();
    // Create fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {listener, ticket, data, msg};
};

it('removes orderId in ticket, when order for ticket is cancelled', async () => {
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event without orderId', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    //check published data for
    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
    );
    expect(ticketUpdatedData.id).toEqual(data.ticket.id);
    expect(ticketUpdatedData.orderId).not.toBeDefined();
});
