# Security Hardening Kit — Solomon Teknika

Drop-in security layer for all Solomon Teknika apps. Zero monthly cost.

## Stack Compatibility
- Supabase (PostgreSQL + Auth + Edge Functions)
- React Native / Expo
- Vercel (hosting + serverless)
- Stripe (payments)

## Components

| # | Component | File(s) | What It Blocks |
|---|-----------|---------|----------------|
| 1 | **Secure Headers** | `vercel.json` | XSS, clickjacking, MIME sniffing, protocol downgrade |
| 2 | **Input Validation** | `utils/validation.ts` | SQL injection, XSS, malformed data, file upload exploits |
| 3 | **Secure Token Storage** | `services/secure-storage.ts` | Token theft, session hijacking, insecure storage |
| 4 | **CSRF Protection** | `middleware/csrf.ts` | Cross-site request forgery |
| 5 | **Rate Limiting** | `supabase/functions/rate-limiter/` + `migrations/003_rate_limits.sql` | Brute force, DDoS, scraping, credential stuffing |
| 6 | **Fraud Detection** | `supabase/functions/fraud-detector/` + `migrations/004_fraud_signals.sql` | Scammers, fake accounts, chargeback fraud |

## Integration Guide

### Step 1: Secure Headers (5 min)
Copy `vercel.json` headers into your project's existing `vercel.json`. If you don't have one, use this file directly.

### Step 2: Input Validation (30 min)
1. Install Zod: `npm install zod`
2. Copy `utils/validation.ts` into your `utils/` folder
3. Import and use schemas at every user input point:
```typescript
import { validate, LoginSchema, ServiceListingSchema } from './utils/validation';

const result = validate(LoginSchema, { email, password });
if (!result.success) {
  // Show result.errors to user
  return;
}
// Use result.data (sanitized + typed)
```

### Step 3: Secure Token Storage (20 min)
1. Install: `npx expo install expo-secure-store`
2. Copy `services/secure-storage.ts` into your `services/` folder
3. Replace AsyncStorage token calls with SecureStorage:
```typescript
import { SecureStorage } from './services/secure-storage';

// Instead of: AsyncStorage.setItem('token', token)
await SecureStorage.saveToken('auth_token', token);

// Instead of: AsyncStorage.getItem('token')
const token = await SecureStorage.getToken('auth_token');

// Check session validity
if (!await SecureStorage.isSessionValid()) {
  // Redirect to login
}
```

### Step 4: CSRF Protection (15 min)
1. Copy `middleware/csrf.ts` into your `middleware/` folder
2. For Supabase Edge Functions:
```typescript
import { csrfMiddleware } from './middleware/csrf';
// Wrap your handler
export default csrfMiddleware.supabaseMiddleware(yourHandler);
```
3. For Vercel API routes:
```typescript
import { csrfMiddleware } from './middleware/csrf';
export default csrfMiddleware.vercelMiddleware(yourHandler);
```

### Step 5: Rate Limiting (30 min)
1. Run migration: `supabase db push` with `003_rate_limits.sql`
2. Deploy Edge Function: `supabase functions deploy rate-limiter`
3. Configure as a hook in Supabase dashboard or call from your API middleware

### Step 6: Fraud Detection (30 min)
1. Run migration: `supabase db push` with `004_fraud_signals.sql`
2. Deploy Edge Function: `supabase functions deploy fraud-detector`
3. Call from your app when events occur:
```typescript
// When a booking is created
await fetch(`${SUPABASE_URL}/functions/v1/fraud-detector`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    event: 'booking_created',
    userId: user.id,
    metadata: { amount: booking.price, serviceId: booking.serviceId }
  })
});
```
4. Check fraud status before allowing transactions:
```typescript
const blocked = await isUserBlocked(userId);
if (blocked) {
  // Deny transaction, show support contact
}
```

## Rate Limits (Default)

| Endpoint Category | Requests/Minute |
|-------------------|-----------------|
| Auth (login, signup, OTP) | 5 |
| General API | 60 |
| Search | 30 |
| Booking/Transaction | 10 |
| File Upload | 5 |

## Fraud Signal Scores

| Signal | Score | Auto-block Threshold |
|--------|-------|---------------------|
| Multiple accounts same IP | 30 | Combined score >= 100 |
| Rapid booking + cancel | 40 | |
| Payment chargeback | 50 | |
| Impossible travel | 60 | |
| New account + high value | 25 | |
| Suspicious review pattern | 20 | |

## Dependencies (All Free)

- `zod` — Input validation (MIT, 0 cost)
- `expo-secure-store` — Encrypted mobile storage (included in Expo, 0 cost)
- Supabase Edge Functions — Rate limiting + fraud detection (free tier: 500K invocations/month)
- Supabase PostgreSQL — Rate limit + fraud tables (free tier: 500MB)
- Vercel headers — Security headers (free tier)

**Total monthly cost: $0**

## TAVARA Holdings Confidential
This security hardening kit is proprietary to TAVARA Holdings / Solomon Teknika.
