const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = 'mingo-admin-session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export interface AdminSessionUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface AdminServerSession {
  accessToken: string;
  user: AdminSessionUser;
  expiresAt: number;
}

function sessionSecret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV !== 'production') {
    return 'mingo-development-only-session-secret-change-me';
  }
  return null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function jwtExpiration(accessToken: string): number | null {
  const payload = accessToken.split('.')[1];
  const decoded = payload ? fromBase64Url(payload) : null;
  if (!decoded) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(decoded)) as { exp?: unknown };
    return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function createAdminSession(
  accessToken: string,
  user: Omit<AdminSessionUser, 'role'> & { role: string },
): Promise<string | null> {
  const secret = sessionSecret();
  if (!secret || user.role !== 'admin') return null;

  const maximumExpiration = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const tokenExpiration = jwtExpiration(accessToken);
  const session: AdminServerSession = {
    accessToken,
    user: { id: user.id, email: user.email, role: 'admin' },
    expiresAt: tokenExpiration ? Math.min(tokenExpiration, maximumExpiration) : maximumExpiration,
  };
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(value: string | null | undefined): Promise<AdminServerSession | null> {
  const secret = sessionSecret();
  if (!secret || !value) return null;

  const [payload, encodedSignature, ...extra] = value.split('.');
  if (!payload || !encodedSignature || extra.length > 0) return null;
  const signature = fromBase64Url(encodedSignature);
  const decodedPayload = fromBase64Url(payload);
  if (!signature || !decodedPayload) return null;

  const validSignature = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(secret),
    signature,
    encoder.encode(payload),
  );
  if (!validSignature) return null;

  try {
    const session = JSON.parse(new TextDecoder().decode(decodedPayload)) as Partial<AdminServerSession>;
    if (
      typeof session.accessToken !== 'string' ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Date.now() ||
      !session.user ||
      typeof session.user.id !== 'string' ||
      typeof session.user.email !== 'string' ||
      session.user.role !== 'admin'
    ) {
      return null;
    }
    return session as AdminServerSession;
  } catch {
    return null;
  }
}
