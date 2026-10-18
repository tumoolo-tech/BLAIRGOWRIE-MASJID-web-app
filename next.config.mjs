const isDev = process.env.NODE_ENV === 'development';

// Supabase project (REST + realtime websocket). Falls back to any Supabase host if unset.
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://*.supabase.co';
const supabaseWs = supabase.replace(/^https:/, 'wss:');

// Pages are statically prerendered, so Next's inline bootstrap scripts can't carry a
// per-request nonce: 'unsafe-inline' is required for scripts. Do NOT add
// upgrade-insecure-requests: WebKit applies it to http://127.0.0.1 and breaks local
// Safari testing; HSTS already forces https in production.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  // Event images are URLs typed in by the admin, so any https image is allowed.
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  `connect-src 'self' ${supabase} ${supabaseWs} https://api.aladhan.com`,
  'frame-src https://masjidboardlive.com https://maps.google.com https://www.google.com',
  "form-action 'self' https://formsubmit.co",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
