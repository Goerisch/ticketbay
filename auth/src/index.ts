import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import {currentUserRouter} from './routes/current-user';
import {signupRouter} from './routes/signup';
import {signinRouter} from './routes/signin';
import {signoutRouter} from './routes/signout';
import {errorHandler} from './middlewares/error-handler';
import {NotFoundError} from './errors/not-found-error';

const app = express();
//allows connection to ingress nginx via proxy
app.set('trust proxy', true);
app.use(json());
//enforces HTTPS, but the Cookie won't be encrypted itself
app.use(
    cookieSession({
        signed: false,
        secure: true,
    }),
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('/*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined!');
    }

    try {
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log('listening on port 3000!');
    });
};

start();
