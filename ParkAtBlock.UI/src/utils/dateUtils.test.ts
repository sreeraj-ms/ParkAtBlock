import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './dateUtils'

describe('formatRelativeTime', () => {
  it('formats a recent timestamp as just now', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('Just now')
  })

  it('formats older timestamps in minutes', () => {
    expect(formatRelativeTime(new Date(Date.now() - 120_000).toISOString())).toBe('2m ago')
  })
})