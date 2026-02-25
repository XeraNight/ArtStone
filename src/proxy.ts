import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Security headers to add to all responses
const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME-type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Control referrer info
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Limit browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  // XSS Protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',
  // HSTS – only active on HTTPS (Vercel/production)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    // Supabase API
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    // Scripts: self + inline (needed for Next.js hydration)
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    // Styles: self + inline (needed for Tailwind/shadcn)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts
    "font-src 'self' https://fonts.gstatic.com",
    // Images: self + data URIs (for generated avatars etc.)
    "img-src 'self' data: blob: https://*.supabase.co",
    // Forms: only self
    "form-action 'self'",
    // Frames: none
    "frame-ancestors 'none'",
  ].join('; '),
}

export default async function proxy(request: NextRequest) {
  const response = await updateSession(request)

  // Inject security headers into every response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
