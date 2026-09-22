export const routes = {
  home: '#/',
  scenario: (id: string) => `#/scenario/${id}`,
}

export type Route = { name: 'home' } | { name: 'scenario'; id: string }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '')
  const segments = path.split('/').filter(Boolean)
  if (segments[0] === 'scenario' && segments[1]) {
    return { name: 'scenario', id: decodeURIComponent(segments[1]) }
  }
  return { name: 'home' }
}
