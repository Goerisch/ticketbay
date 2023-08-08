import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import {
    BadRequestError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from '@dgticketbay/common';
import {body} from 'express-validator';
import {Ticket} from '../models/ticket';
import {Order} from '../models/orders';
import {OrderCreatedPublisher} from '../events/publishers/order-created-publisher';
import {natsWrapper} from '../nats-wrapper';

const router = express.Router();

const RESERVATION_WINDOW_SECONDS = 15 * 60;

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('TicketId must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        // Find ticket of order in the db
        const {ticketId} = req.body;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }
        // Make sure ticket hasn't been reserved already
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved!');
        }
        // Calculate expiration date for the order
        const expiresAt = new Date();
        expiresAt.setSeconds(
            expiresAt.getSeconds() + RESERVATION_WINDOW_SECONDS,
        );
        // Build order and save to db
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt,
            ticket,
        });
        await order.save();
        // Publish event for new order
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {id: ticket.id, price: ticket.price},
        });
        // Respond to API-Caller
        res.status(201).send(order);
    },
);

export {router as createOrderRouter};
