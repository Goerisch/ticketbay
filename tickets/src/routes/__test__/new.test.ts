import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
});

it('can not be accessed when logged in', async () => {
    await request(app).post('/api/tickets').send({}).expect(401);
});

it('can be accessed when logged in', async () => {
    const response = await await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it('error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({title: '', price: 5})
        .expect(400);
});

it('error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({price: 10})
        .expect(400);
});

it('error if an negative price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({title: 'valid title', price: -10})
        .expect(400);
});

it('error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({title: 'valid title'})
        .expect(400);
});

it('creates a ticket with valid request', async () => {
    //check ticket gets saved to db
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({title: 'valid title', price: 12})
        .expect(201);
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});
