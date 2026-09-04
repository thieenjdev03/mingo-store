const YOUTUBE_HOSTS = new Set(['youtube.com', 'youtu.be', 'youtube-nocookie.com']);

/** Trích xuất video ID từ các dạng link YouTube phổ biến. */
export function getYouTubeVideoId(value: string | null | undefined): string | null {
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  if (!YOUTUBE_HOSTS.has(hostname)) return null;

  let id = '';
  if (hostname === 'youtu.be') {
    id = url.pathname.split('/').filter(Boolean)[0] ?? '';
  } else if (url.pathname === '/watch') {
    id = url.searchParams.get('v') ?? '';
  } else {
    const segments = url.pathname.split('/').filter(Boolean);
    const markerIndex = segments.findIndex((segment) => segment === 'embed' || segment === 'shorts' || segment === 'live');
    id = markerIndex >= 0 ? segments[markerIndex + 1] ?? '' : '';
  }

  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

/** Tạo URL embed YouTube nền, tự phát không tiếng và không hiện controller. */
export function buildYouTubeEmbedUrl(value: string): string | null {
  const videoId = getYouTubeVideoId(value);
  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    disablekb: '1',
    loop: '1',
    playlist: videoId,
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    iv_load_policy: '3',
    // Ẩn nút fullscreen (không cần vì banner đã tự full-bleed) và caption box —
    // banner chỉ để trang trí nền, không phải player cho người dùng tương tác.
    fs: '0',
    cc_load_policy: '0',
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
