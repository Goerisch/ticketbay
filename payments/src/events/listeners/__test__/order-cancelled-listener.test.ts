import {OrderCancelledEvent, OrderStatus} from '@dgticketbay/common';
import {natsWrapper} from '../../../nats-wrapper';
import {OrderCancelledListener} from '../order-cancelled-listener';
import mongoose from 'mongoose';
import {Order} from '../../../models/order';
import {Message} from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        price: 20,
        userId: 'fakeUser',
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {id: 'fakeTicket'},
    };
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };
    return {order, data, msg, listener};
};

it('updates status of the order', async () => {
    const {listener, order, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
