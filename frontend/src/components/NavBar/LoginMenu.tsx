import { Box } from '@mui/material'
import LoadingIndicator from 'components/LoadingIndicator'
import Login from 'components/Login'
import { authAtom } from 'infrastructure/dataAccess/atoms'
import { useAtom } from 'jotai'
import React from 'react'
import { useOrientation } from 'utils/hooks'

export const LoginMenu: React.FC = () => {
  const [authState] = useAtom(authAtom)
  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'
  return (
    <div style={{ visibility: authState.loggedIn ? 'hidden' : 'visible' }}>
      <React.Suspense fallback={<LoadingIndicator />}>
        <Box
          sx={{
            width: isPortrait ? 'auto' : '70%',
            margin: `${isPortrait ? '0' : '2em'} auto 0 auto`,
            justifyContent: 'center',
            position: isPortrait ? 'absolute' : 'static',
            right: '2em',
            top: '5em'
          }}
        >
          <Login />
        </Box>
      </React.Suspense>
    </div>
  )
}

export default LoginMenu
