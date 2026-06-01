/**
 * Razorpay Webhook + Payment Route Test
 * Run: node test-webhook.js
 *
 * Tests all 5 active webhook events + auth guards (9 tests total)
 */

require('dotenv').config();
const http   = require('http');
const crypto = require('crypto');

const SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const PORT   = process.env.PORT || 3000;

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

// ─── helpers ──────────────────────────────────────────────────────────────────
function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname: 'localhost', port: PORT, path, method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(raw), ...headers },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(raw);
    req.end();
  });
}

function sign(rawBody) {
  return crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex');
}

function makeWebhookPayload(event) {
  return JSON.stringify({
    entity: 'event',
    event,
    payload: {
      payment: {
        entity: {
          id: 'pay_TestFake001',
          status: 'captured',
          order_id: 'order_TestFake001',
          amount: 100000,
          currency: 'INR',
          method: 'upi',
        },
      },
      order: {
        entity: {
          id: 'order_TestFake001',
          amount: 100000,
          currency: 'INR',
          status: 'paid',
        },
      },
      refund: {
        entity: {
          id: 'rfnd_TestFake001',
          payment_id: 'pay_TestFake001',
          amount: 100000,
        },
      },
    },
  });
}

let passed = 0, failed = 0;

function pass(label, detail = '') {
  console.log(`  ${GREEN}✅ PASS${RESET}  ${label}${detail ? `  ${YELLOW}(${detail})${RESET}` : ''}`);
  passed++;
}
function fail(label, detail = '') {
  console.log(`  ${RED}❌ FAIL${RESET}  ${label}${detail ? `  ${YELLOW}(${detail})${RESET}` : ''}`);
  failed++;
}
function section(title) {
  console.log(`\n${BOLD}${title}${RESET}`);
}

// ─── run tests ────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BOLD} LoveNest — Razorpay Full Webhook Test Suite${RESET}`);
  console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`  Webhook secret : ${SECRET ? SECRET.slice(0, 14) + '…' : 'NOT SET ❌'}`);
  console.log(`  Server         : http://localhost:${PORT}`);

  // ── 1. Invalid signature ─────────────────────────────────────────────────
  section('1. Invalid signature → must reject with 400');
  try {
    const res = await request('POST', '/payment/webhook', makeWebhookPayload('payment.captured'), {
      'x-razorpay-signature': 'bad_signature',
    });
    res.status === 400 && res.body?.message?.toLowerCase().includes('invalid')
      ? pass('Rejected correctly', `status=${res.status}`)
      : fail(`Expected 400 Invalid — got ${res.status}`, JSON.stringify(res.body));
  } catch (e) { fail('Request failed — is the server running?', e.message); }

  // ── 2–6. All 5 active events with valid signatures ────────────────────────
  const events = [
    { name: 'payment.captured', desc: '→ activate premium' },
    { name: 'order.paid',       desc: '→ activate premium (idempotent)' },
    { name: 'payment.failed',   desc: '→ mark as failed' },
    { name: 'refund.processed', desc: '→ revoke premium' },
    { name: 'refund.failed',    desc: '→ log only' },
  ];

  for (const [i, ev] of events.entries()) {
    section(`${i + 2}. ${ev.name} ${ev.desc}`);
    try {
      const body = makeWebhookPayload(ev.name);
      const res  = await request('POST', '/payment/webhook', body, { 'x-razorpay-signature': sign(body) });
      // 200 = handled; 404 = signature accepted but no real DB record (expected in test env)
      if (res.status === 200 || res.status === 404) {
        pass('Signature accepted & event routed correctly', `status=${res.status} — ${res.body?.message}`);
      } else if (res.status === 400) {
        fail('Signature rejected or validation error', JSON.stringify(res.body));
      } else if (res.status === 500) {
        fail('Handler threw an exception (TypeError/crash)', JSON.stringify(res.body));
      } else {
        fail(`Unexpected status ${res.status}`, JSON.stringify(res.body));
      }
    } catch (e) { fail('Request failed', e.message); }
  }

  // ── 7–9. Auth guards ──────────────────────────────────────────────────────
  const authRoutes = [
    { method: 'POST', path: '/payment/verify', body: { razorpay_order_id: 'x', razorpay_payment_id: 'x', razorpay_signature: 'x' } },
    { method: 'POST', path: '/payment/create', body: { membershipType: 'Essential' } },
    { method: 'GET',  path: '/payment/verify', body: '' },
  ];

  for (const [i, r] of authRoutes.entries()) {
    section(`${i + 7}. ${r.method} ${r.path} — unauthenticated (expects 401)`);
    try {
      const res = await request(r.method, r.path, r.body);
      (res.status === 401 || res.status === 403)
        ? pass('Auth guard active', `status=${res.status}`)
        : fail(`Expected 401/403 — got ${res.status}`, JSON.stringify(res.body));
    } catch (e) { fail('Request failed', e.message); }
  }

  // ── summary ───────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`  ${failed === 0
    ? GREEN + '✅ All tests passed'
    : RED + `❌ ${failed} test(s) failed`}${RESET}  (${passed}/${total})`);
  console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

  if (failed > 0) process.exit(1);
}

run().catch((e) => { console.error(RED + 'Unhandled:', e.message + RESET); process.exit(1); });
