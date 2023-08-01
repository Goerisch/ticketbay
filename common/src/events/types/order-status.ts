export enum OrderStatus {
    // When the order has been created, but the
    // ticket it is trying to order has not been reserved yet
    Created = 'created',

    // When the user has cancelled the order
    // Or when the ticket already has been reserved
    // Or when the order expired before payment
    Cancelled = 'cancelled',

    // The order has successfully reserved the ticket
    AwaitingPayment = 'awaiting:payment',

    // The user provided payment successfully
    Complete = 'complete',
}
