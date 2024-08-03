import { Box } from '@mui/material'
import React from 'react'
import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorDisplay from 'ui/shared/ui/ErrorDisplay'
import SuccessDisplay from 'ui/shared/ui/SuccessDisplay'
import ErrorFallback from 'ui/shared/ui/ErrorFallback'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'
import { useSize } from 'ui/shared/hooks/useSize'

export const MainLayout: React.FC = () => {
  const { isTiny } = useSize()

  return (
    <Box sx={{ display: 'flex', flex: '1 1 auto', minHeight: 0, flexDirection: isTiny ? 'column-reverse' : 'row' }}>
      <Box
        component="main"
        sx={{
          width: isTiny ? '100dvw' : '90dvw',
          padding: '0',
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          margin: '0 0 0 0'
        }}
      >
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <React.Suspense fallback={<LoadingSkeleton skeletonProps={{ height: '4em' }} />}>
            <Outlet />
            <ErrorDisplay />
            <SuccessDisplay />
          </React.Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  )
}
