import type Token from 'markdown-it/lib/token.mjs'

interface TokenRenderer {
  [key: string]: (token: Token, tokens: Token[], index: number) => string
}

const renderers: TokenRenderer = {
  heading_open: (token, _tokens, index) => {
    return index > 0 ? `\n${token.markup} ` : `${token.markup} `
  },
  heading_close: () => '\n\n',
  paragraph_open: (_token, tokens, index) => {
    const prevToken = index > 0 ? tokens[index - 1] : null
    if (!prevToken)
      return ''

    if (isInsideBlockquote(tokens, index)) {
      const level = getBlockquoteNestingLevel(tokens, index)
      return prevToken.type === 'blockquote_open' ? '' : `\n${'>'.repeat(level)} `
    }

    if (prevToken.type === 'list_item_open')
      return ''
    return prevToken.type.includes('heading_close') ? '' : '\n'
  },
  paragraph_close: (token, tokens, index) => {
    const nextToken = tokens[index + 1]
    if (nextToken && nextToken.type === 'blockquote_close')
      return '\n'
    if (isInsideBlockquote(tokens, index))
      return '\n'
    return '\n'
  },
  bullet_list_open: () => '\n',
  bullet_list_close: () => '',
  ordered_list_open: () => '\n',
  ordered_list_close: () => '',
  list_item_open: (token, tokens, index) => {
    const indent = '  '.repeat(getListNestingLevel(tokens, index))
    const prevToken = index > 0 ? tokens[index - 1] : null
    const prefix = prevToken && !prevToken.type.includes('list') ? '\n' : ''

    if (token.info) {
      return `${prefix}${indent}${token.info}. `
    }
    if (token.markup === '.') {
      let num = 1
      for (let i = index - 1; i >= 0; i--) {
        if (tokens[i].type === 'list_item_open' && tokens[i].markup === '.') {
          num++
        }
        if (tokens[i].type === 'ordered_list_open')
          break
      }
      return `${prefix}${indent}${num}. `
    }
    return `${prefix}${indent}- `
  },
  list_item_close: (token, tokens, index) => {
    const nextToken = tokens[index + 1]
    if (!nextToken)
      return '\n'
    if (nextToken.type.includes('list_close'))
      return '\n'
    if (nextToken.type === 'list_item_open')
      return ''
    return '\n'
  },
  code_block: token => `\n\`\`\`${token.info}\n${token.content.trim()}\n\`\`\`\n\n`,
  fence: token => `\n\`\`\`${token.info}\n${token.content.trim()}\n\`\`\`\n\n`,
  blockquote_open: (_token, tokens, index) => {
    const level = getBlockquoteNestingLevel(tokens, index)
    const prevToken = index > 0 ? tokens[index - 1] : null
    const prefix = prevToken && !prevToken.type.includes('blockquote') ? '\n' : ''
    return `${prefix}${'>'.repeat(level)} `
  },
  blockquote_close: () => '',
  table_open: () => '\n',
  table_close: () => '\n\n',
  tr_open: () => '',
  tr_close: (_token, tokens, index) => {
    if (index > 0 && tokens[index - 1].type === 'thead_close') {
      const alignRow = getTableAlignmentRow(tokens, index)
      return `|\n${alignRow}\n`
    }
    return '|\n'
  },
  td_open: () => '| ',
  td_close: () => ' ',
  th_open: () => '| ',
  th_close: () => ' ',
  hr: () => '\n---\n\n',
  inline: (token, tokens, index) => {
    const parent = tokens[index - 1]
    // @ts-expect-error parent type
    if (parent && parent.type === 'paragraph_open' && parent.parent === 'blockquote_open') {
      const level = getBlockquoteNestingLevel(tokens, index - 1)
      return token.content.split('\n').map(line => line.trim()).join(`\n${'>'.repeat(level)} `)
    }
    return token.content
  },
  link_open: () => '[',
  link_close: token => `](${token.attrs?.[0][1] || ''})`,
  code_inline: token => `\`${token.content}\``,
  strong_open: () => '**',
  strong_close: () => '**',
  em_open: () => '*',
  em_close: () => '*',
  s_open: () => '~~',
  s_close: () => '~~',
  image: token => `![${token.content}](${token.attrs?.[0][1] || ''}${token.attrs?.[1]?.[1] ? ` "${token.attrs[1][1]}"` : ''})`,
  container_directives_open: token => `\n:::${token.info || ''}\n`,
  container_directives_close: () => ':::\n\n',
  html_block: token => token.content,
}

function getListNestingLevel(tokens: Token[], currentIndex: number): number {
  let level = 0
  for (let i = currentIndex; i >= 0; i--) {
    if (tokens[i].type === 'bullet_list_open' || tokens[i].type === 'ordered_list_open')
      level++
    if (tokens[i].type === 'bullet_list_close' || tokens[i].type === 'ordered_list_close')
      level--
  }
  return level - 1
}

function getBlockquoteNestingLevel(tokens: Token[], currentIndex: number): number {
  let level = 0
  for (let i = 0; i <= currentIndex; i++) {
    if (tokens[i].type === 'blockquote_open')
      level++
    if (tokens[i].type === 'blockquote_close')
      level--
  }
  return level
}

function getTableAlignmentRow(tokens: Token[], trCloseIndex: number): string {
  const alignments = []
  let i = trCloseIndex
  while (i >= 0 && tokens[i].type !== 'thead_open') {
    if (tokens[i].type === 'th_open') {
      const align = tokens[i].attrs?.find(([key]) => key === 'style')?.[1] || ''
      if (align.includes('center'))
        alignments.unshift(':---:')
      else if (align.includes('right'))
        alignments.unshift('---:')
      else
        alignments.unshift('---')
    }
    i--
  }
  return `|${alignments.map(a => ` ${a} `).join('|')}|`
}

function isInsideBlockquote(tokens: Token[], currentIndex: number): boolean {
  let level = 0
  for (let i = currentIndex; i >= 0; i--) {
    if (tokens[i].type === 'blockquote_close')
      level--
    if (tokens[i].type === 'blockquote_open')
      level++
  }
  return level > 0
}

export function renderMarkdownItTokens(tokens: Token[]): string {
  let result = ''
  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]
    const renderer = renderers[token.type]
    if (renderer)
      result += renderer(token, tokens, i)
    else if (token.children)
      result += renderMarkdownItTokens(token.children)
    else
      result += token.content

    i++
  }
  return result.replace(/\s+$/, '')
}
