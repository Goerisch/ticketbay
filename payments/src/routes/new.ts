import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {
    requireAuth,
    validateRequest,
    BadRequestError,
    NotFoundError,
    NotAuthorizedError,
    OrderStatus,
} from '@dgticketbay/common';
import {Order} from '../models/order';
import {stripe} from '../stripe';
import {Payment} from '../models/payment';
import {PaymentCreatedPublisher} from '../events/publishers/payment-created-publisher';
import {natsWrapper} from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [body('orderId').not().isEmpty()],
    validateRequest,
    async (req: Request, res: Response) => {
        const {token, orderId} = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for cancelled orders');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: order.price * 100,
            currency: 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        const stripeId = paymentIntent.client_secret;
        if (!stripeId) {
            throw new Error(
                'Client_secret for paymentIntent must be included in the response!',
            );
        }
        const payment = Payment.build({
            orderId,
            stripeId,
        });
        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(201).send({payment});
    },
);

export {router as createChargeRouter};
