import { CircularProgress, CircularProgressProps, Paper, PaperProps } from '@mui/material'
import React from 'react'

interface LoadingIndicatorProps extends PaperProps {
  size?: CircularProgressProps['size']
  progressProps?: CircularProgressProps
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size, progressProps, ...paperProps }) => {
  return (
    <Paper
      elevation={0}
      {...paperProps}
      sx={{
        ...{
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center'
        },
        ...paperProps.sx
      }}
    >
      <CircularProgress size={size} color="secondary" {...progressProps} />
    </Paper>
  )
}

export default LoadingIndicator
