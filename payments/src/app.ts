import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import {errorHandler, NotFoundError, currentUser} from '@dgticketbay/common';
import {createChargeRouter} from './routes/new';

const app = express();
//allows connection to ingress nginx via proxy
app.set('trust proxy', true);
app.use(json());
//enforces HTTPS, but the Cookie won't be encrypted itself
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    }),
);
app.use(currentUser);

app.use(createChargeRouter);

app.all('/*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};
