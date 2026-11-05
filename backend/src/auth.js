import { config } from './config.js'

let clerkModulePromise = null

const loadClerk = async () => {
  if (!config.hasClerkSecret) {
    return null
  }

  if (!clerkModulePromise) {
    clerkModulePromise = import('@clerk/backend').catch((error) => {
      console.error('Clerk backend SDK is unavailable:', error.message)
      return null
    })
  }

  return clerkModulePromise
}

const getBearerToken = (req) => {
  const header = req.headers.authorization
  if (typeof header !== 'string' || !header.toLowerCase().startsWith('bearer ')) {
    return null
  }

  return header.slice(7).trim() || null
}

/**
 * Authenticate a request. Demo identity headers are deliberately accepted only
 * when demo auth is enabled (development/test by default). Production requires
 * a Clerk secret and a verified Clerk session token.
 */
export const getUserId = async (req) => {
  const token = getBearerToken(req)

  if (token) {
    const clerk = await loadClerk()
    if (!clerk?.verifyToken) {
      return null
    }

    try {
      const claims = await clerk.verifyToken(token, { secretKey: config.clerkSecretKey })
      req.plan = typeof claims.pla === 'string' && claims.pla.split(',').includes(`u:${config.proPlanSlug}`) ? 'pro' : 'free'
      return typeof claims.sub === 'string' && claims.sub ? claims.sub : null
    } catch {
      return null
    }
  }

  if (config.allowDemoAuth) {
    const headerId = req.headers['x-user-id']
    if (typeof headerId === 'string' && /^[A-Za-z0-9_:@.-]{1,128}$/.test(headerId.trim())) {
      return headerId.trim()
    }
  }

  return null
}
