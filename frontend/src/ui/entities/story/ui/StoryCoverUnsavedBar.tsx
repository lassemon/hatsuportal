import { Box } from '@mui/material'
import React from 'react'

interface StoryCoverUnsavedBarProps {
  visible: boolean
}

export const StoryCoverUnsavedBar: React.FC<StoryCoverUnsavedBarProps> = ({ visible }) => {
  if (!visible) {
    return null
  }

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '0.6em',
        bgcolor: 'warning.main',
        boxShadow: (theme) => `0 0 0.5em ${theme.palette.warning.main}`,
        zIndex: 2,
        pointerEvents: 'none',
        '&:after': {
          content: '"unsaved changes"',
          fontSize: '0.5em',
          position: 'absolute',
          top: '-1px',
          width: '100%',
          textAlign: 'center',
          color: (theme) => theme.palette.warning.contrastText
        }
      }}
    />
  )
}
