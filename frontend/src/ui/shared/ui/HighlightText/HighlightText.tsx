import React from 'react'
import { Box } from '@mui/material'

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

interface HighlightTextProps {
  text: string
  highlight?: string
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight }) => {
  const query = highlight?.trim()

  if (!query) {
    return <>{text}</>
  }

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Box component="span" className="highlight" key={index}>
            {part}
          </Box>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  )
}
