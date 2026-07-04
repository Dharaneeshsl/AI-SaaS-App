export const getEnv = (key, fallback = '') => {
  return globalThis.__AI_SASS_ENV__?.[key] || import.meta.env?.[key] || fallback
}

export const API_BASE_URL = getEnv('VITE_API_BASE_URL', 'http://127.0.0.1:8787')
