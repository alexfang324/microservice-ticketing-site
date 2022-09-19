import request from 'supertest';
import { app } from '../../app';

it('returns 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: '123456',
      password: 'password'
    })
    .expect(400);
});

it('returns 400 without a password', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: ''
    })
    .expect(400);
});

it('fail when a non-existent email is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '1'
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
