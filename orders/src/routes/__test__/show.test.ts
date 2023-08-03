import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';

it('fetches the order', async () => {
    //create a ticket
    const ticket = Ticket.build({
        title: 'Hans Zimmer',
        price: 44,
    });
    await ticket.save();

    const user = global.signin();
    //request to build order with the ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);
    //fetch order
    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('error when providing invalid orderId', async () => {
    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/123`)
        .set('Cookie', global.signin())
        .send()
        .expect(400);
});

it('error when trying to find non existing order', async () => {
    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/63cbc4938b4ca3984c39bcc8`)
        .set('Cookie', global.signin())
        .send()
        .expect(404);
});

it('error when trying to access order from other user', async () => {
    //create a ticket
    const ticket = Ticket.build({
        title: 'Hans Zimmer',
        price: 44,
    });
    await ticket.save();

    const userOne = global.signin();
    const userTwo = global.signin();
    //request to build order with the ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ticketId: ticket.id})
        .expect(201);
    //fetch order with other user
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);
});
