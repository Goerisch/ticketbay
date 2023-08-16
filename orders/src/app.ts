import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import {errorHandler, NotFoundError, currentUser} from '@dgticketbay/common';
import {createOrderRouter} from './routes/new';
import {showOrderRouter} from './routes/show';
import {indexOrderRouter} from './routes';
import {deleteOrderRouter} from './routes/delete';

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
app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('/*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};
