import request from 'supertest';
import {app} from '../../app';

it('fails when a mail which doesnt exist is submitted', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'non-existent@test.com',
            password: 'password',
        })
        .expect(400);
});

it('fails when an incorrect password is submitted', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: '1234abcd',
        })
        .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);
    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});
