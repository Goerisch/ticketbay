import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import {Order, OrderStatus} from '../../models/orders';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';

it('returns error if ticket does not exit', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404);
});

it('returns error if ticket is already reserved', async () => {
    //save ticket to db
    const ticket = Ticket.build({title: 'faun', price: 20});
    await ticket.save();
    const ticketId = ticket.id;
    //reserve that ticket
    const order = Order.build({
        userId: '123abc',
        status: OrderStatus.Created,
        ticket,
        expiresAt: new Date(),
    });
    await order.save();
    //try to reserve the same ticket again.
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(400);
    //make sure, no event has been emitted
    expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

it('successfully reserves a ticket', async () => {
    //save ticket to db
    const ticket = Ticket.build({title: 'faun', price: 20});
    await ticket.save();
    const ticketId = ticket.id;
    //reserve the ticket
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(201);
});

it('emits an order created event', async () => {
    //save ticket to db
    const ticket = Ticket.build({title: 'faun', price: 20});
    await ticket.save();
    const ticketId = ticket.id;
    //reserve the ticket
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
