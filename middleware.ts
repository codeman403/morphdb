import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
];

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight(request);
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Add CORS headers to response
  const response = addCORSHeaders(supabaseResponse, request);
  
  // Add security headers to all responses
  addSecurityHeaders(response);
  
  return response;
}

function handleCORSPreflight(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return addCORSHeaders(response, request);
}

function addCORSHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = !origin || ALLOWED_ORIGINS.includes(origin);

  if (isAllowedOrigin && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept'
  );
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking - only allow framing from same origin
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information sent with requests
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enforce HTTPS (1 year, include subdomains, allow preload)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Restrict browser features/APIs
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Content Security Policy - restrictive but allows necessary resources
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://vercel.live wss://ws-us3.pusher.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://vercel.live",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
