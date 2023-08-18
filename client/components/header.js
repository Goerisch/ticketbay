import Link from 'next/link';

export default ({currentUser}) => {
    const links = [
        !currentUser && {label: 'Sign Up', href: '/auth/signup'},
        !currentUser && {label: 'Sign In', href: '/auth/signin'},
        {label: 'All Tickets', href: '/'},
        currentUser && {label: 'Sell Tickets', href: '/tickets/new'},
        currentUser && {label: 'Edit Your Tickets', href: '/tickets/sales'},
        currentUser && {label: 'My Orders', href: '/orders'},
        currentUser && {label: 'Sign Out', href: '/auth/signout'},
        ,
    ]
        .filter((linkConfig) => linkConfig)
        .map(({label, href}) => {
            return (
                <li key={href} className='nav-item'>
                    <Link className='nav-link' href={href}>
                        {label}
                    </Link>
                </li>
            );
        });
    return (
        <nav className='navbar navbar-light bg-light'>
            <Link href='/' className='navbar-brand'>
                TicketBay
            </Link>

            <div className='d-flex justifiy-contend-end'>
                <ul className='nav d-flex align-items-center'>{links}</ul>
            </div>
        </nav>
    );
};
