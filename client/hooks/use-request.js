import axios from 'axios';
import {useState} from 'react';

export default ({url, method, body, onSuccess}) => {
    const [errors, setErrors] = useState(null);
    //accepts self-signed certificates,
    //TODO: must be set true for production!
    const httpsAgent = new https.Agent({rejectUnauthorized: false});
    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios[method](
                url,
                {...body, ...props},
                httpsAgent,
            );

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (error) {
            setErrors(
                <div className='alert alert-danger'>
                    <h4>Ooops...</h4>
                    <ul className='my-0'>
                        {error.response.data.errors.map((err) => (
                            <li key={err.message}>{err.message}</li>
                        ))}
                    </ul>
                </div>,
            );
        }
    };

    return {doRequest, errors};
};
