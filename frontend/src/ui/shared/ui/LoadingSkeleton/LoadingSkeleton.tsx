import { Paper, PaperProps, Skeleton, SkeletonProps } from '@mui/material'
import React from 'react'

interface LoadingSkeletonProps extends SkeletonProps {
  paperProps?: PaperProps
  skeletonProps?: SkeletonProps
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ paperProps, skeletonProps }) => {
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
          justifyContent: 'center',
          ...(paperProps?.sx ?? {})
        }
      }}
    >
      <Skeleton
        variant="rounded"
        animation="wave"
        {...skeletonProps}
        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.21)', minHeight: '4em', height: '100%', width: '100%', ...(skeletonProps?.sx ?? {}) }}
      />
    </Paper>
  )
}

export default LoadingSkeleton
