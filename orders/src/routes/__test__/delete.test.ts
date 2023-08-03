import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {Order, OrderStatus} from '../../models/orders';

it('marks order as cancelled', async () => {
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
    //cancel order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);
    const cancelledOrder = await Order.findById(order.id);
    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('error when providing invalid orderId', async () => {
    await request(app)
        .delete(`/api/orders/123`)
        .set('Cookie', global.signin())
        .send()
        .expect(400);
});

it('error when trying to cancel non existing order', async () => {
    await request(app)
        .delete(`/api/orders/63cbc4938b4ca3984c39bcc8`)
        .set('Cookie', global.signin())
        .send()
        .expect(404);
});

it('error when trying to cancel order from other user', async () => {
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
    //try to cancel order with other user
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);
});

it.todo('emits event when order gets cancelled');
