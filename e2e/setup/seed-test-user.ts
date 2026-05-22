/**
 * One-time setup: creates a verified test account for E2E tests.
 * Run once before the first test run:
 *   npx tsx e2e/setup/seed-test-user.ts
 *
 * The account credentials default to:
 *   email:    qa@devfolio.test
 *   password: QApassword1!
 * Override with env vars TEST_EMAIL / TEST_PASSWORD.
 */

const API      = process.env.API_URL       ?? 'http://localhost:3001/api/v1';
const EMAIL    = process.env.TEST_EMAIL    ?? 'qa@devfolio.test';
const PASSWORD = process.env.TEST_PASSWORD ?? 'QApassword1!';
const NAME     = process.env.TEST_NAME     ?? 'QA Test User';

async function main() {
  console.log(`Seeding test user: ${EMAIL}`);

  // 1. Register
  const reg = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: NAME, email: EMAIL, password: PASSWORD }),
  });

  if (reg.status === 409) {
    console.log('User already exists — skipping registration.');
  } else if (!reg.ok) {
    const body = await reg.text();
    console.error('Registration failed:', reg.status, body);
    process.exit(1);
  } else {
    console.log('Registered.');
  }

  // 2. Verify via dev endpoint (only available in non-production)
  const verify = await fetch(`${API}/auth/dev-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL }),
  });

  if (verify.ok) {
    console.log('Email verified via dev endpoint.');
  } else if (verify.status === 404) {
    console.warn(
      'Dev-verify endpoint not found. Verify manually:\n' +
      '  Check your email or ask admin to run: UPDATE users SET "isVerified"=true WHERE email=\'' + EMAIL + '\';'
    );
  } else {
    console.warn('Verify returned:', verify.status, await verify.text());
  }

  // 3. Test login
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (login.ok) {
    console.log('Login successful — test account is ready.');
  } else {
    const body = await login.text();
    console.error('Login failed:', login.status, body);
    console.log('\nIf email is unverified, run this SQL on your Postgres:');
    console.log(`  UPDATE users SET "isVerified"=true WHERE email='${EMAIL}';`);
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
