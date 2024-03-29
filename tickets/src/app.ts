import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import {errorHandler, NotFoundError, currentUser} from '@dgticketbay/common';
import {createTicketRouter} from './routes/new';
import {showTicketRouter} from './routes/show';
import {indexTicketRouter} from './routes';
import {updateTicketRouter} from './routes/update';

const app = express();
//allows connection to ingress nginx via proxy
app.set('trust proxy', true);
app.use(json());
//enforces HTTPS, but the Cookie won't be encrypted itself
app.use(
    cookieSession({
        signed: false,
        secure: false,
    }),
);
app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('/*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};
