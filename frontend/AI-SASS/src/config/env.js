export const getEnv = (key, fallback = '') => {
  return globalThis.__AI_SASS_ENV__?.[key] || import.meta.env?.[key] || fallback
}

const loopbackHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1'])

const hostnameOf = (value) => {
  try {
    return new URL(value, 'http://localhost').hostname
  } catch {
    return ''
  }
}

/**
 * Resolve the backend API base URL for the current page origin.
 *
 * - On localhost (dev/preview) the configured base is used directly
 *   (e.g. http://127.0.0.1:8787), with CORS handled by the backend.
 * - When the app is served from a non-local host (deployed preview, reverse
 *   proxy, or production), a loopback base would point at the visitor's own
 *   machine. In that case fall back to same-origin relative requests (""),
 *   which the hosting server / proxy routes to the backend.
 * - An explicitly configured non-loopback base is always respected.
 */
const resolveApiBaseUrl = (configured) => {
  const pageHostname = typeof location !== 'undefined' ? location.hostname : ''
  const isLocalPage = !pageHostname || loopbackHosts.has(pageHostname)
  const isLoopbackBase = !configured || loopbackHosts.has(hostnameOf(configured))

  if (!isLocalPage && isLoopbackBase) {
    return ''
  }

  return configured
}

export const API_BASE_URL = resolveApiBaseUrl(getEnv('VITE_API_BASE_URL', ''))
