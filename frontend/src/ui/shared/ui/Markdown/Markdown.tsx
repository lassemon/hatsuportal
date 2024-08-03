import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'

interface MarkdownProps {
  children: string
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
  protocols: {
    ...(defaultSchema.protocols ?? {}),
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https']
  }
}

export const Markdown: React.FC<MarkdownProps> = ({ children }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        [rehypeSanitize, sanitizeSchema],
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
      ]}
    >
      {children}
    </ReactMarkdown>
  )
}
