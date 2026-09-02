/**
 * Backend origin is server-only and must never use a `NEXT_PUBLIC_` variable.
 */
export function getServerApiUrl(): string | null {
  const value = process.env.API_URL;
  return value?.replace(/\/+$/, '') || null;
}

export function buildServerApiUrl(pathname: string, search = ''): string | null {
  const baseUrl = getServerApiUrl();
  if (!baseUrl) return null;

  const base = new URL(`${baseUrl}/`);
  const normalizedPath = pathname.replace(/^\/+/, '');
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/${normalizedPath}`;
  base.search = search;
  return base.toString();
}
