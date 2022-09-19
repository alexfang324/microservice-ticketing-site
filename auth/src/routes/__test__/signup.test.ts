import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
});

it('returns 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: '123456',
      password: 'password'
    })
    .expect(400);
});

it('returns 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '1'
    })
    .expect(400);
});

it('returns 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: '',
      password: 'password'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: ''
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
