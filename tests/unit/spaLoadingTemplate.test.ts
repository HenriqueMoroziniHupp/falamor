import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// A tela de carregamento precisa aparecer antes de qualquer JS ou arquivo externo (ADR 0012).
const html = readFileSync(new URL('../../app/spa-loading-template.html', import.meta.url), 'utf8')
const svg = html.match(/<svg\b[^>]*>/)?.[0] ?? ''

describe('spa-loading-template', () => {
  it('has no external references', () => {
    expect(html).not.toMatch(/\bsrc\s*=/i)
    expect(html).not.toMatch(/\bhref\s*=/i)
    expect(html).not.toMatch(/url\(/i)
    expect(html).not.toMatch(/@import/i)
    expect(html).not.toMatch(/<script\b/i)
  })

  it('respects reduced motion', () => {
    expect(html).toContain('prefers-reduced-motion')
  })

  it('is announced as loading and keeps the heart decorative', () => {
    expect(html).toContain('role="progressbar"')
    expect(html).toMatch(/aria-label="[^"]+"/)
    expect(svg).toContain('aria-hidden="true"')
  })

  it('has no visible text', () => {
    const text = html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
      .replace(/<[^>]+>/g, '')
    expect(text.trim()).toBe('')
  })
})
