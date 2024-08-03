import { Box } from '@mui/material'
import { isPromise } from '@hatsuportal/common'
import { useAtomValue } from 'jotai'
import React from 'react'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { DiscoverViewer } from 'ui/features/discover/model/DiscoverViewer'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'
import { DiscoverFeedSessionRoot } from 'ui/features/discover/ui/DiscoverFeedSessionRoot'

const DiscoverFeedPlaceholder: React.FC = () => (
  <Box sx={{ flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
    <Box
      sx={{
        flex: '1 1 0',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <LoadingSkeleton
        skeletonProps={{
          sx: {
            height: '70%',
            aspectRatio: '9/16',
            maxWidth: '100%',
            borderRadius: '0.75em'
          }
        }}
      />
    </Box>
  </Box>
)

export const DiscoverPostsPanel: React.FC = () => {
  const authState = useAtomValue(authAtom)

  if (isPromise(authState) || !DiscoverViewer.authIsReady(authState)) {
    return <DiscoverFeedPlaceholder />
  }

  const viewer = DiscoverViewer.fromAuth(authState)

  return (
    <Box sx={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: 'min-content' }}>
      <DiscoverFeedSessionRoot key={viewer.toSessionKey()} authState={authState} />
    </Box>
  )
}
