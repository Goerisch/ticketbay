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
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }
        if (req.currentUser!.id !== order.userId) {
            throw new NotAuthorizedError();
        }
        order.status = OrderStatus.Cancelled;
        await order.save();

        //TODO publish event order has been cancelled

        res.status(204).send();
    },
);

export {router as deleteOrderRouter};
