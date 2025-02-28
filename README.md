# render-markdown-it-tokens

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Render `markdown-it` tokens back to Markdown

## Usage

```
npm install render-markdown-it-tokens
```

```js
import { renderMarkdownItTokens } from 'render-markdown-it-tokens'

const tokens = [
  { type: 'heading_open', tag: 'h1', level: 1 },
  { type: 'inline', content: 'Hello, world!' },
  { type: 'heading_close', tag: 'h1', level: 1 },
]

const markdown = renderMarkdownItTokens(tokens)
console.log(markdown)
// # Hello, world!
```

## License

[MIT](./LICENSE) License © [onmax](https://github.com/onmax)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/render-markdown-it-tokens?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/render-markdown-it-tokens
[npm-downloads-src]: https://img.shields.io/npm/dm/render-markdown-it-tokens?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/render-markdown-it-tokens
[bundle-src]: https://img.shields.io/bundlephobia/minzip/render-markdown-it-tokens?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=render-markdown-it-tokens
[license-src]: https://img.shields.io/github/license/onmax/render-markdown-it-tokens.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/onmax/render-markdown-it-tokens/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/render-markdown-it-tokens
