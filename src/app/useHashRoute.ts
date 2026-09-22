import { useSyncExternalStore } from 'react'
import { parseHash, type Route } from '@/app/routes'

/**
 * Hash routing keeps the production build a plain static site: it can be
 * opened from any path, or straight from the file system, with no server
 * rewrites.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useHashRoute(): Route {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  )
  return parseHash(hash)
}
