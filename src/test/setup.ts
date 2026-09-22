import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom has no layout, so scrolling is a no-op rather than an error.
window.scrollTo = () => {}

afterEach(() => {
  cleanup()
})
