import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
    'sk_test_51NetmXGU4lT1uifg7tp47wcmDNkaXmTpP62gJtZXSXQol3u9gvFGy8gq4JVqxh0gCnRtmfvdbFVXxhq3SdYcqEJO00Z5L8OJRh';

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'testkey';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signin = (id?: string) => {
    //Build JWT payload
    const payload = {
        id: id ? id : new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
    };
    //Create JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    //Build session Object.
    const session = {jwt: token};
    //Turn session into JSON
    const sessionJSON = JSON.stringify(session);
    //Encode as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');
    //return cookie
    return [`session=${base64}`];
};
