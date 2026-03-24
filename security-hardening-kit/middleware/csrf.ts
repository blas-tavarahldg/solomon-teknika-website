// Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
// Proprietary and confidential.

import { createHash, randomBytes } from 'crypto';

interface CSRFTokenPayload {
  token: string;
  createdAt: number;
  expiresAt: number;
}

interface CSRFRequest {
  method: string;
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
}

interface CSRFValidationResult {
  valid: boolean;
  message?: string;
  token?: string;
}

const tokenStore = new Map<string, CSRFTokenPayload>();
const TOKEN_LIFETIME = 60 * 60 * 1000;
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_COOKIE_NAME = 'csrf_token';

function generateCSRFToken(): string {
  const randomBuffer = randomBytes(32);
  return randomBuffer.toString('hex');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function createCSRFToken(sessionId: string): CSRFTokenPayload {
  const token = generateCSRFToken();
  const createdAt = Date.now();
  const expiresAt = createdAt + TOKEN_LIFETIME;

  const payload: CSRFTokenPayload = {
    token,
    createdAt,
    expiresAt,
  };

  const tokenKey = `${sessionId}:${hashToken(token)}`;
  tokenStore.set(tokenKey, payload);
  if (tokenStore.size > 1000) cleanupExpiredTokens();

  return payload;
}

function cleanupExpiredTokens(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, payload] of tokenStore.entries()) {
    if (payload.expiresAt < now) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => tokenStore.delete(key));
}

function validateCSRFToken(request: CSRFRequest, sessionId: string): CSRFValidationResult {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
    return { valid: true };
  }
  try {
    const headerToken = extractTokenFromHeader(request.headers);
    if (!headerToken) return { valid: false, message: 'CSRF token missing from header' };
    const cookieToken = extractTokenFromCookie(request.cookies);
    if (!cookieToken) return { valid: false, message: 'CSRF token missing from cookie' };
    if (headerToken !== cookieToken) return { valid: false, message: 'Token mismatch' };
    const tokenKey = `${sessionId}:${hashToken(headerToken)}`;
    const storedPayload = tokenStore.get(tokenKey);
    if (!storedPayload) return { valid: false, message: 'Token not found' };
    if (storedPayload.expiresAt < Date.now()) {
      tokenStore.delete(tokenKey);
      return { valid: false, message: 'Token expired' };
    }
    return { valid: true };
  } catch (error) {
    console.error('CSRF validation error:', error);
    return { valid: false, message: 'Validation error' };
  }
}

function extractTokenFromHeader(headers: Record<string, string | string[] | undefined>): string | null {
  const headerValue = headers[CSRF_HEADER_NAME.toLowerCase()];
  if (!headerValue) {
    return null;
  }

  const token = typeof headerValue === 'string' ? headerValue : headerValue[0];
  return token || null;
}

function extractTokenFromCookie(cookies?: Record<string, string>): string | null {
  if (!cookies) {
    return null;
  }

  return cookies[CSRF_COOKIE_NAME] || null;
}

class CSRFMiddleware {
  validate(request: CSRFRequest, sessionId: string): CSRFValidationResult {
    return validateCSRFToken(request, sessionId);
  }

  generateTokens(sessionId: string): {
    token: string;
    cookieHeader: string;
  } {
    const payload = createCSRFToken(sessionId);
    const token = payload.token;
    const cookieHeader = [
      `${CSRF_COOKIE_NAME}=${token}`,
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      `Max-Age=${Math.floor(TOKEN_LIFETIME / 1000)}`,
    ].join('; ');

    return {
      token,
      cookieHeader,
    };
  }

  supabaseMiddleware(
    handler: (req: Request) => Promise<Response> | Response,
    getSessionId: (req: Request) => string
  ): (req: Request) => Promise<Response> {
    return async (req: Request): Promise<Response> => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        const sessionId = getSessionId(req);
        const csrfRequest: CSRFRequest = {
          method: req.method,
          headers: Object.fromEntries(req.headers),
          cookies: parseCookies(req.headers.get('cookie') || ''),
        };
        const validation = this.validate(csrfRequest, sessionId);
        if (!validation.valid) {
          return new Response(JSON.stringify({ error: validation.message }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      return handler(req);
    };
  }

  vercelMiddleware(
    handler: (req: any, res: any) => Promise<void> | void,
    getSessionId: (req: any) => string
  ): (req: any, res: any) => Promise<void> {
    return async (req: any, res: any): Promise<void> => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        const sessionId = getSessionId(req);
        const csrfRequest: CSRFRequest = { method: req.method, headers: req.headers, cookies: req.cookies || {} };
        const validation = this.validate(csrfRequest, sessionId);
        if (!validation.valid) return res.status(403).json({ error: validation.message });
      }
      return handler(req, res);
    };
  }
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

export const csrfMiddleware = new CSRFMiddleware();
export { generateCSRFToken, validateCSRFToken, createCSRFToken };
export type { CSRFTokenPayload, CSRFRequest, CSRFValidationResult };
