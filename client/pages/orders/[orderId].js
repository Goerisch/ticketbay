import {useEffect, useState} from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderDetails = ({order, currentUser}) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id,
        },
        onSuccess: () => Router.push('/orders'),
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };
        //first call immediately
        findTimeLeft();
        //first execution after the intervall
        const timerId = setInterval(findTimeLeft, 1000);
        return () => {
            clearInterval(timerId);
        };
    }, [order]);

    if (timeLeft < 0) {
        return <div>Sorry, your order expired</div>;
    }

    return (
        <div>
            <p>Your order expires in: {timeLeft} seconds</p>
            <br />
            <h1>{order.ticket.title}</h1>
            <h4>{order.ticket.price}€</h4>
            <StripeCheckout
                token={({id}) => doRequest({token: id})}
                stripeKey={process.env.NEXT_PUBLIC_STRIPE_KEY}
                amount={order.ticket.price * 100}
                currency='eur'
                email={currentUser.email}
                name={order.ticket.title}
            ></StripeCheckout>
            {errors}
        </div>
    );
};

OrderDetails.getInitialProps = async (context, client) => {
    const {orderId} = context.query;
    const {data} = await client.get(`/api/orders/${orderId}`);

    return {order: data};
};

export default OrderDetails;
