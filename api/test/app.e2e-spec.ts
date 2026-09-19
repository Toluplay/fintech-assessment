import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Veridian mock API (e2e)', () => {
  let app: INestApplication;
  /** Shared session: login is rate limited to 5/min, so tests reuse one token. */
  let authHeader: string;
  let sessionCookie: string[];
  const server = () => app.getHttpServer();

  beforeAll(async () => {
    process.env.MOCK_LATENCY_MS = '0';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    const { body, headers } = await login();
    authHeader = `Bearer ${body.accessToken}`;
    sessionCookie = headers['set-cookie'] as unknown as string[];
  });

  afterAll(async () => {
    // Drop keep-alive sockets left by supertest so close() does not wait on them.
    app.getHttpServer().closeAllConnections?.();
    await app.close();
  });

  async function login(identifier = 'john@example.com', password = 'Password123!') {
    return request(server()).post('/auth/login').send({ identifier, password });
  }

  describe('POST /auth/login', () => {
    it('returns an access token, the public user and sets an HttpOnly refresh cookie', async () => {
      const res = await login();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        user: { id: '123', name: 'John Doe', email: 'john@example.com' },
      });
      expect(res.body.user).not.toHaveProperty('passwordHash');
      const cookie = String(res.headers['set-cookie']);
      expect(cookie).toContain('vf_refresh=');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Strict');
    });

    it('accepts a phone number as the identifier', async () => {
      const res = await login('08012345678');
      expect(res.status).toBe(200);
    });

    it('rejects bad credentials with a generic 401', async () => {
      const res = await login('john@example.com', 'wrong-password');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Incorrect email/phone number or password');
    });

    it('validates the payload (400)', async () => {
      const res = await request(server()).post('/auth/login').send({ identifier: '' });
      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(expect.arrayContaining([expect.any(String)]));
    });
  });

  describe('protected resources', () => {
    it('rejects requests without a token (401)', async () => {
      await request(server()).get('/savings-products').expect(401);
      await request(server()).get('/users/me').expect(401);
    });

    it('rejects tampered tokens (401)', async () => {
      await request(server())
        .get('/savings-products')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });

    it('serves savings products and details', async () => {
      const auth = authHeader;
      const list = await request(server()).get('/savings-products').set('Authorization', auth);
      expect(list.status).toBe(200);
      expect(list.body).toHaveLength(3);
      expect(list.body[0]).toMatchObject({
        id: '1',
        name: 'Target Savings',
        interestRate: 12,
        minimumAmount: 5000,
        duration: '12 months',
      });

      const detail = await request(server()).get('/savings-products/3').set('Authorization', auth);
      expect(detail.status).toBe(200);
      expect(detail.body.features.length).toBeGreaterThan(0);
      await request(server()).get('/savings-products/999').set('Authorization', auth).expect(404);
    });

    it('serves loan products and details', async () => {
      const auth = authHeader;
      const list = await request(server()).get('/loan-products').set('Authorization', auth);
      expect(list.body).toHaveLength(3);
      expect(list.body[0]).toMatchObject({ name: 'Personal Loan', minAmount: 50000, maxAmount: 2000000 });
      const detail = await request(server()).get('/loan-products/3').set('Authorization', auth);
      expect(detail.body.interestRate).toBeNull();
      expect(detail.body.eligibility.length).toBeGreaterThan(0);
    });

    it('masks sensitive profile data', async () => {
      const me = await request(server()).get('/users/me').set('Authorization', authHeader);
      expect(me.status).toBe(200);
      expect(me.body.accountNumberMasked).toBe('******6789');
      expect(me.body).not.toHaveProperty('accountNumber');
      expect(me.body).not.toHaveProperty('bvn');
    });

    it('performs authenticated product actions', async () => {
      const auth = authHeader;
      const start = await request(server())
        .post('/savings-products/1/start')
        .set('Authorization', auth)
        .send({});
      expect(start.status).toBe(201);
      expect(start.body.status).toBe('pending_funding');

      const tooSmall = await request(server())
        .post('/savings-products/1/start')
        .set('Authorization', auth)
        .send({ amount: 100 });
      expect(tooSmall.status).toBe(400);

      const apply = await request(server())
        .post('/loan-products/2/apply')
        .set('Authorization', auth)
        .send({ amount: 100000 });
      expect(apply.status).toBe(201);
      expect(apply.body.status).toBe('under_review');
    });
  });

  describe('session refresh & logout', () => {
    it('refreshes with the cookie only when the CSRF header is present, and revokes on logout', async () => {
      const cookie = sessionCookie;

      await request(server()).post('/auth/refresh').set('Cookie', cookie).expect(403);

      const refreshed = await request(server())
        .post('/auth/refresh')
        .set('Cookie', cookie)
        .set('X-Requested-With', 'XMLHttpRequest');
      expect(refreshed.status).toBe(200);
      expect(refreshed.body.accessToken).toEqual(expect.any(String));

      // The old refresh token was rotated out.
      await request(server())
        .post('/auth/refresh')
        .set('Cookie', cookie)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect(401);

      const rotated = refreshed.headers['set-cookie'];
      await request(server())
        .post('/auth/logout')
        .set('Cookie', rotated)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect(204);
      await request(server())
        .post('/auth/refresh')
        .set('Cookie', rotated)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect(401);
    });
  });

  describe('error contract', () => {
    it('simulated failures use the shared error shape without leaking internals', async () => {
      const res = await request(server())
        .get('/loan-products')
        .set('Authorization', authHeader)
        .set('X-Simulate-Status', '500');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        statusCode: 500,
        error: expect.any(String),
        message: expect.any(String),
      });
      expect(JSON.stringify(res.body)).not.toMatch(/at .*\.ts:/);
    });
  });
  describe('rate limiting', () => {
    it('throttles repeated login attempts (429)', async () => {
      let status = 0;
      for (let attempt = 0; attempt < 6 && status !== 429; attempt += 1) {
        status = (await login('john@example.com', 'definitely-wrong')).status;
      }
      expect(status).toBe(429);
    });
  });
});
