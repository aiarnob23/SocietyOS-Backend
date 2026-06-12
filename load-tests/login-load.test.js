import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '10s',
};

export default function () {
  const res = http.post(
    'http://localhost:3000/api/v1/auth/login',
    JSON.stringify({
      email: 'aiarnob23@gmail.com',
      password: '@0284Society',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  check(res, {
    'status 200': (r) => r.status === 200,
  });
}