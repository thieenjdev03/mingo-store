'use client';

const CART_TOKEN_KEY = 'mingo-cart-token-v1';
export const CART_UPDATED_EVENT = 'mingo:cart-updated';

function createCartToken(): string {
  const browserCrypto = window.crypto;
  if (typeof browserCrypto.randomUUID === 'function') {
    return browserCrypto.randomUUID().replaceAll('-', '');
  }

  const bytes = new Uint8Array(32);
  browserCrypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getOrCreateCartToken(): string {
  if (typeof window === 'undefined') {
    throw new Error('Cart token chỉ được tạo trong trình duyệt');
  }

  const current = window.localStorage.getItem(CART_TOKEN_KEY);
  if (current && /^[A-Za-z0-9_-]{32,256}$/.test(current)) return current;

  const token = createCartToken();
  window.localStorage.setItem(CART_TOKEN_KEY, token);
  return token;
}

export function notifyCartUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}
