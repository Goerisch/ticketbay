import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import jwt from 'jsonwebtoken';
import {validateRequest, BadRequestError} from '@dgticketbay/common';

import {User} from '../models/user';
import {Password} from '../services/password';

const router = express.Router();

router.post(
    '/api/users/signin',
    [
        body('email').isEmail().withMessage('Email mus be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must submit a password!'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const {email, password} = req.body;

        const existingUser = await User.findOne({email});
        if (!existingUser) {
            //delay in order to prevent giving a clue whether the user exists, based on the response time
            await Password.compare('invalid.password', 'password');
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch = await Password.compare(
            existingUser.password,
            password,
        );

        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        // Generate JWT
        const userJwt = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
            },
            process.env.JWT_KEY!,
        );
        // Store JWT on session cookie
        req.session = {
            jwt: userJwt,
        };

        res.status(200).send(existingUser);
    },
);

export {router as signinRouter};
