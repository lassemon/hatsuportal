import rateLimit from 'express-rate-limit'

/**
 * Applied to all /api/v1/* endpoints.
 * 300 requests per 15-minute window per IP is generous for normal interactive use
 * while still blocking naive scrapers and brute-force loops.
 */
export const apiRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true, // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false, // Disable X-RateLimit-* (older, non-standard)
  message: { message: 'Too many requests. Please slow down.' },
  skip: () => process.env.NODE_ENV === 'test'
})

/**
 * Applied only to /api/v1/auth/*.
 * Tighter window for login and token refresh to limit credential-stuffing.
 */
export const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
  skip: () => process.env.NODE_ENV === 'test'
})
