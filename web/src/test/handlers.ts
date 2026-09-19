import { http, HttpResponse } from 'msw';
import { LOAN_PRODUCTS, PROFILE, SAVINGS_PRODUCTS, SESSION } from './fixtures';

const API = 'http://localhost/api';

export const VALID_CREDENTIALS = { identifier: 'john@example.com', password: 'Password123!' };

/** Happy-path handlers mirroring the NestJS API contract. */
export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { identifier: string; password: string };
    if (
      body.identifier === VALID_CREDENTIALS.identifier &&
      body.password === VALID_CREDENTIALS.password
    ) {
      return HttpResponse.json(SESSION);
    }
    return HttpResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Incorrect email/phone number or password' },
      { status: 401 },
    );
  }),
  http.post(`${API}/auth/refresh`, () =>
    HttpResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'No active session' },
      { status: 401 },
    ),
  ),
  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${API}/users/me`, () => HttpResponse.json(PROFILE)),
  http.get(`${API}/savings-products`, () =>
    HttpResponse.json(SAVINGS_PRODUCTS.map(({ features, terms, longDescription, maximumAmount, ...s }) => s)),
  ),
  http.get(`${API}/savings-products/:id`, ({ params }) => {
    const product = SAVINGS_PRODUCTS.find((item) => item.id === params.id);
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json(
          { statusCode: 404, error: 'NotFound', message: 'Savings product not found' },
          { status: 404 },
        );
  }),
  http.post(`${API}/savings-products/:id/start`, ({ params }) =>
    HttpResponse.json(
      {
        planId: 'SP-1',
        productId: params.id,
        status: 'pending_funding',
        message: 'Your plan has been created.',
      },
      { status: 201 },
    ),
  ),
  http.get(`${API}/loan-products`, () =>
    HttpResponse.json(
      LOAN_PRODUCTS.map(({ eligibility, requirements, longDescription, disbursement, ...s }) => s),
    ),
  ),
  http.get(`${API}/loan-products/:id`, ({ params }) => {
    const product = LOAN_PRODUCTS.find((item) => item.id === params.id);
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json(
          { statusCode: 404, error: 'NotFound', message: 'Loan product not found' },
          { status: 404 },
        );
  }),
  http.post(`${API}/loan-products/:id/apply`, ({ params }) =>
    HttpResponse.json(
      {
        applicationId: 'LN-1',
        productId: params.id,
        status: 'under_review',
        message: 'Your application has been received.',
      },
      { status: 201 },
    ),
  ),
];

/** Helper to make any endpoint fail with the API's error envelope. */
export function failWith(method: 'get' | 'post', path: string, status: number, message = 'Simulated failure') {
  return http[method](`${API}${path}`, () =>
    HttpResponse.json({ statusCode: status, error: 'Error', message }, { status }),
  );
}

/** Helper to simulate the network being unreachable. */
export function networkError(method: 'get' | 'post', path: string) {
  return http[method](`${API}${path}`, () => HttpResponse.error());
}
