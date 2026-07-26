// Client-side mirror of the backend whitelist
// (ecom-website: src/modules/distributors/utils/maps-embed.util.ts).
// Keep both in sync — only https://www.google.com/maps/embed... is accepted.

export const MAPS_EMBED_PROTOCOL = 'https:';
export const MAPS_EMBED_HOST = 'www.google.com';
export const MAPS_EMBED_PATH_PREFIX = '/maps/embed';

export function extractMapsSrc(raw: string): string | null {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return null;

  let candidate = trimmed;
  if (/<iframe/i.test(trimmed)) {
    const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!match?.[1]) return null;
    candidate = match[1];
  }

  candidate = candidate.trim();

  try {
    const url = new URL(candidate);
    const isWhitelisted =
      url.protocol === MAPS_EMBED_PROTOCOL &&
      url.hostname === MAPS_EMBED_HOST &&
      url.pathname.startsWith(MAPS_EMBED_PATH_PREFIX);

    return isWhitelisted ? candidate : null;
  } catch {
    return null;
  }
}
