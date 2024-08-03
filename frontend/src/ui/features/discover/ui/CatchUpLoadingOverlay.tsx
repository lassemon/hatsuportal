import { Box } from '@mui/material'
import React from 'react'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'

export const CatchUpLoadingOverlay: React.FC = () => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default'
    }}
  >
    <LoadingSkeleton
      skeletonProps={{
        sx: {
          height: '100%',
          width: '100%',
          maxWidth: 'min(100%, calc(100cqh * 9 / 16))',
          aspectRatio: '9/16',
          borderRadius: '0.75em'
        }
      }}
    />
  </Box>
)

export default CatchUpLoadingOverlay
