import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import {natsWrapper} from '../../nats-wrapper';
import {Ticket} from '../../models/ticket';

it('returns 404 if ticket does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({title: 'adsfds', price: 11})
        .expect(404);
});

it('returns 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({title: 'adsfds', price: 11})
        .expect(401);
});

it('returns 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Hans Zimmer',
            price: 34,
        });
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({title: 'abc', price: 4})
        .expect(401);
});

it('returns 400 if the user provides invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Hans Zimmer',
            price: 34,
        });
    const id = response.body.id;
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 34,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Hans Zimmer',
            price: -14,
        })
        .expect(400);
});

it('updates ticket when inputs are valid', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Hans Zimmer',
            price: 34,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Subway to Sally',
            price: 67,
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('Subway to Sally');
    expect(ticketResponse.body.price).toEqual(67);
});

it('publishes an event', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Hans Zimmer',
            price: 34,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Subway to Sally',
            price: 67,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('throws badRequestError if ticket is reserved', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Hans Zimmer',
            price: 34,
        });
    //find the ticket in db
    const ticket = await Ticket.findById(response.body.id);
    //reserve the ticket
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();
    //try to update the ticket
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Subway to Sally',
            price: 99,
        })
        .expect(400);
});
