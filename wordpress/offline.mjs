export default {
  fetch() {
    return new Response('Temporarily unavailable.\n', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'Retry-After': '86400',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  },
};
