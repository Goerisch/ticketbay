import Link from 'next/link';

const MyTicketsPage = ({currentUser, tickets}) => {
    function isMyTicket(element, index, array) {
        return element.userId === currentUser.id;
    }
    const myTickets = tickets.filter(isMyTicket);
    const ticketList = myTickets.map((ticket) => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}€</td>
                <td>
                    <button
                        className='btn btn-secondary'
                        disabled={ticket.orderId}
                    >
                        <Link
                            className='nav-link'
                            href='/tickets/edit/[ticketId]'
                            as={`/tickets/edit/${ticket.id}`}
                        >
                            Edit
                        </Link>
                    </button>
                </td>
            </tr>
        );
    });
    return (
        <div>
            <h1>My Tickets</h1>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Edit</th>
                    </tr>
                </thead>
                <tbody>{ticketList}</tbody>
            </table>
        </div>
    );
};

MyTicketsPage.getInitialProps = async (context, client, currentUser) => {
    const {data} = await client.get('/api/tickets');
    return {tickets: data};
};

export default MyTicketsPage;
