// Resolve a stable user identifier from an incoming request so creations can be
// scoped per user. Two sources are supported:
//
//   1. A Clerk session JWT in the `Authorization: Bearer <token>` header. The
//      `sub` claim is the Clerk user id.
//   2. An `x-user-id` header (the Clerk user id sent directly by the frontend).
//
// NOTE: When CLERK_SECRET_KEY is configured you should verify the JWT signature
// against Clerk's JWKS before trusting it. This helper decodes the claim without
// verifying the signature, which is sufficient for the demo/starter flow but
// should be hardened (e.g. with `@clerk/backend`) before handling sensitive data.

const decodeJwtSub = (token) => {
  const parts = token.split('.')

  if (parts.length !== 3) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

export const getUserId = (req) => {
  const authHeader = req.headers['authorization']

  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    const sub = decodeJwtSub(authHeader.slice(7).trim())
    if (sub) {
      return sub
    }
  }

  const headerId = req.headers['x-user-id']
  if (typeof headerId === 'string' && headerId.trim()) {
    return headerId.trim()
  }

  return null
}
