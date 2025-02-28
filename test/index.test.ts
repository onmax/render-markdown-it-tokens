/// <reference types="vite/client" />

import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import { renderMarkdownItTokens } from '../src'

describe('should', () => {
  it('exported', () => {
    const md = new MarkdownIt()
    expect(md).toBeDefined()
  })

  describe('cases', async () => {
    const cases = await Promise.all(Object.entries(import.meta.glob('./cases/*/input.md', { query: '?raw', import: 'default' })).map(async ([path, input]) => [path, await input()])) as [string, string][]

    for (const [path, input] of cases) {
      it(`parse ${path}`, async () => {
        const md = new MarkdownIt()
        const tokens = md.parse(input, {})
        await expect(JSON.stringify(tokens, null, 2)).toMatchFileSnapshot(path.replace('input.md', 'tokens.json'))
        await expect(renderMarkdownItTokens(tokens)).toMatchFileSnapshot(path.replace('input.md', 'output.md'))
      })
    }
  })
})
