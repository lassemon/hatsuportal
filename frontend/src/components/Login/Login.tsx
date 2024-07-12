import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import LoginDialog from 'components/LoginDialog'
import { useAtom } from 'jotai'
import { authAtom } from 'infrastructure/dataAccess/atoms'
import { logout, status } from 'api/auth'
import { scheduleAsyncFunction } from 'utils/utils'
import _ from 'lodash'
import { uuid } from '@hatsuportal/common'
import { UserResponseDTO } from '@hatsuportal/application'
import { useOrientation } from 'utils/hooks'

const Login: React.FC = () => {
  const [authState, setAuthState] = useAtom(authAtom)
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false)
  const [isLoggedOutDialogOpen, setLoggedOutDialogOpen] = useState(false)
  const [startPollingTrigger, setStartPollingTrigger] = useState<string>('')

  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'

  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout | undefined

    const shouldContinuePolling = () => {
      return authState.loggedIn && isMounted
    }
    // calling status every 10 seconds ensures that if the jwt token expires, the refreshToken
    // functionality should recreate the token. This should ensure the user staying
    // logged in as long as the browser tab remains active
    scheduleAsyncFunction(
      status,
      60000,
      shouldContinuePolling,
      (_intervalId) => {
        if (_intervalId) {
          intervalId = _intervalId
        }
      },
      (pollingPromise) => {
        pollingPromise.catch((error) => {
          clearTimeout(intervalId)
          setLoggedOutDialogOpen(true)
        })
      }
    )
    return () => {
      isMounted = false
      clearTimeout(intervalId)
    }
  }, [authState.loggedIn, startPollingTrigger])

  const openLoginDialog = () => {
    setLoginDialogOpen(true)
  }

  const closeLoginDialog = () => {
    setLoginDialogOpen(false)
  }

  const handleLoginSuccess = (successResponse: UserResponseDTO) => {
    const loggedIn = successResponse && !_.isEmpty(successResponse)
    setAuthState((_authState) => {
      return {
        ..._authState,
        loggedIn: loggedIn,
        user: loggedIn ? successResponse : undefined
      }
    })
    setLoginDialogOpen(false)

    if (loggedIn) {
      setStartPollingTrigger(uuid())
    }
  }

  const onLogout = () => {
    return logout().finally(() => {
      setAuthState(() => {
        return {
          loggedIn: false,
          user: undefined
        }
      })
    })
  }

  const closeLoggedOutDialog = () => {
    setLoggedOutDialogOpen(false)
    onLogout().finally(() => {
      window.location.reload()
    })
  }

  return (
    <>
      {!authState?.loggedIn && (
        <Button variant="contained" onClick={openLoginDialog} fullWidth={isPortrait ? false : true}>
          Login
        </Button>
      )}
      <LoginDialog open={isLoginDialogOpen} onClose={closeLoginDialog} onLoginSuccess={handleLoginSuccess} />
      <Dialog open={isLoggedOutDialogOpen}>
        <DialogTitle
          sx={{
            paddingBottom: '0.5em'
          }}
        >
          Login Expired
        </DialogTitle>
        <DialogContent>
          <Typography variant="caption">You have been logged out while you were away</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={closeLoggedOutDialog}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Login
