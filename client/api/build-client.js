import axios from 'axios';

export default ({req}) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        ? process.env.NEXT_PUBLIC_BASE_URL
        : 'http://www.ticketbucht.de';
    if (typeof window === 'undefined') {
        //we are on the server
        return axios.create({
            baseURL: baseUrl,
            headers: req.headers,
        });
    } else {
        //we are on the browser
        return axios.create({
            baseURL: '/',
        });
    }
};
