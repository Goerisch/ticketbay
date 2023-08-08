import express, {Request, Response} from 'express';
import {
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from '@dgticketbay/common';
import {Order} from '../models/orders';
import {param} from 'express-validator';
import mongoose from 'mongoose';
import {OrderCancelledPublisher} from '../events/publishers/order-cancelled-publisher';
import {natsWrapper} from '../nats-wrapper';

const router = express.Router();

router.delete(
    '/api/orders/:orderId',
    requireAuth,
    [
        param('orderId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('OrderId must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const {orderId} = req.params;
        const order = await Order.findById(orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError();
        }
        if (req.currentUser!.id !== order.userId) {
            throw new NotAuthorizedError();
        }
        order.status = OrderStatus.Cancelled;
        await order.save();

        //publish event order has been cancelled
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {id: order.ticket.id},
        });
        //respond to API-Caller
        res.status(204).send();
    },
);

export {router as deleteOrderRouter};
