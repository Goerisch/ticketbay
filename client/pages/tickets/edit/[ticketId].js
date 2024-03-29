import {useState} from 'react';
import useRequest from '../../../hooks/use-request';
import Router from 'next/router';

const EditTicket = ({ticket}) => {
    const [title, setTitle] = useState(ticket.title);
    const [price, setPrice] = useState(ticket.price);
    const {doRequest, errors} = useRequest({
        url: `/api/tickets/${ticket.id}`,
        method: 'put',
        body: {
            title,
            price,
        },
        onSuccess: () => Router.push('/'),
    });

    const onSubmit = (event) => {
        event.preventDefault();

        doRequest();
    };

    const onBlur = () => {
        const value = parseFloat(price);
        if (isNaN(value)) {
            return;
        }
        setPrice(value.toFixed(2));
    };
    return (
        <div>
            <h1>Edit your Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className='form-control'
                    />
                </div>
                <div className='form-group'>
                    <label>Price</label>
                    <input
                        value={price}
                        onBlur={onBlur}
                        onChange={(e) => setPrice(e.target.value)}
                        className='form-control'
                    />
                </div>
                {errors}
                <br />
                <button className='btn btn-primary'>Submit</button>
            </form>
        </div>
    );
};

EditTicket.getInitialProps = async (context, client) => {
    const {ticketId} = context.query;
    const {data} = await client.get(`/api/tickets/${ticketId}`);

    return {ticket: data};
};

export default EditTicket;
