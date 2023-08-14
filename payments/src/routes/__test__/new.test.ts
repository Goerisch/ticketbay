import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import {Order} from '../../models/order';
import {OrderStatus} from '@dgticketbay/common';
import {stripe} from '../../stripe';
import {Payment} from '../../models/payment';

it('returns 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            orderId: new mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it('returns 401 when purchasing an order that does not belong to user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            orderId: order.id,
        })
        .expect(401);
});

it('returns 401 when not authenticated', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .send({
            orderId: order.id,
        })
        .expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 1,
        price: 20,
        status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            orderId: order.id,
        })
        .expect(400);
});

it('returns 400 when sending empty object', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({})
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 10000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 1,
        price,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({orderId: order.id})
        .expect(201);

    const paymentIntents = await stripe.paymentIntents.list({limit: 50});
    const paymentIntent = paymentIntents.data.find((charge) => {
        return charge.amount === price * 100;
    });

    expect(paymentIntent).toBeDefined();
    expect(paymentIntent!.currency).toEqual('eur');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: paymentIntent!.client_secret,
    });
    expect(payment).not.toBeNull();
});
