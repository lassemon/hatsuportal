import { Button, Dialog, DialogActions, DialogContent, DialogTitle, ListItemButton, ListItemText, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import LoginDialog from 'ui/features/user/components/LoginDialog'
import { UserViewModelDTO } from 'ui/features/user/viewModels/UserViewModel'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'
import { scheduleAsyncFunction } from 'utils'
import _ from 'lodash'
import { useAuthServiceContext } from 'infrastructure/hooks/useAuthServiceContext'
import { uuid } from '@hatsuportal/common'

const AUTHENTICATION_STATUS_POLL_INTERVAL_IN_MILLISECONDS = 60000

const Login: React.FC = () => {
  const authServiceContext = useAuthServiceContext()

  const [authState, setAuthState] = useAtom(authAtom)
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false)
  const [isLoggedOutDialogOpen, setLoggedOutDialogOpen] = useState(false)
  const [startPollingTrigger, setStartPollingTrigger] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout | undefined

    const shouldContinuePolling = () => {
      return authState.loggedIn && isMounted
    }
    // polling status ensures that if the jwt token expires, the refreshToken
    // functionality should recreate the token. This should ensure the user staying
    // logged in as long as the browser tab remains active
    const statusCheck = async () => {
      await authServiceContext.authService.status()
    }
    scheduleAsyncFunction(
      statusCheck,
      AUTHENTICATION_STATUS_POLL_INTERVAL_IN_MILLISECONDS,
      shouldContinuePolling,
      (_intervalId) => {
        if (_intervalId) {
          intervalId = _intervalId
        }
      },
      (pollingPromise) => {
        pollingPromise.catch((error) => {
          console.error(error)
          clearTimeout(intervalId)
          setLoggedOutDialogOpen(true)
        })
      }
    )
    return () => {
      isMounted = false
      clearTimeout(intervalId)
    }
  }, [startPollingTrigger])

  const openLoginDialog = () => {
    setLoginDialogOpen(true)
  }

  const closeLoginDialog = () => {
    setLoginDialogOpen(false)
  }

  const handleLoginSuccess = (successResponse: UserViewModelDTO) => {
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
    return authServiceContext.authService.logout().finally(() => {
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
        <ListItemButton onClick={openLoginDialog}>
          <ListItemText primary={`Login`} />
        </ListItemButton>
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
