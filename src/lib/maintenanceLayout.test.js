import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const css = readFileSync(resolve('src/index.css'), 'utf8')

describe('maintenance layout styles', () => {
  it('stacks tickets and agent logs in one column', () => {
    const block = css.match(/\.maintenance-layout\s*\{[^}]+\}/)?.[0] ?? ''
    expect(block).toMatch(/grid-template-columns:\s*1fr/)
    expect(block).not.toMatch(/1fr\s+1fr/)
  })

  it('does not use a two-column maintenance grid at desktop breakpoints', () => {
    expect(css).not.toMatch(
      /@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?\.maintenance-layout\s*\{[\s\S]*?grid-template-columns:\s*1fr\s+1fr/,
    )
  })
})
