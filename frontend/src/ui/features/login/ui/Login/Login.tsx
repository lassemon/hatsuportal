import { Button, Dialog, DialogActions, DialogContent, DialogTitle, ListItemButton, ListItemText, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import LoginDialog from 'ui/features/login/ui/LoginDialog'
import { UserViewModelDTO } from 'ui/entities/user/model/UserViewModel'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { usePreferenceSetters, fetchAndStorePreferences } from 'ui/entities/user/state/storePreferences'
import { scheduleAsyncFunction } from 'utils'
import isEmpty from 'lodash/isEmpty'
import { useAuthServiceContext } from 'infrastructure/hooks/useAuthServiceContext'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { uuid } from '@hatsuportal/common'
import { sessionExpiredAtom } from 'ui/shared/state/sessionExpiredAtom'
import { useLogout } from 'ui/entities/user/hooks/useLogout'
import { useNavigate } from 'ui/shared/hooks/useNavigate'

const AUTHENTICATION_STATUS_POLL_INTERVAL_IN_MILLISECONDS = 60000

const Login: React.FC = () => {
  const authServiceContext = useAuthServiceContext()
  const entityServiceContext = useEntityServiceContext()
  const { logout } = useLogout()
  const navigate = useNavigate()
  const [authState, setAuthState] = useAtom(authAtom)
  const setters = usePreferenceSetters()
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false)
  const [isLoggedOutDialogOpen, setLoggedOutDialogOpen] = useState(false)
  const [startPollingTrigger, setStartPollingTrigger] = useState<string>('')

  const [sessionExpired, setSessionExpired] = useAtom(sessionExpiredAtom)

  useEffect(() => {
    if (sessionExpired) {
      setLoggedOutDialogOpen(true)
    }
  }, [sessionExpired])

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
        })
      }
    )
    return () => {
      isMounted = false
      clearTimeout(intervalId)
    }
  }, [startPollingTrigger, authState.loggedIn])

  const openLoginDialog = () => {
    setLoginDialogOpen(true)
  }

  const closeLoginDialog = () => {
    setLoginDialogOpen(false)
  }

  const handleLoginSuccess = async (successResponse: UserViewModelDTO) => {
    const loggedIn = successResponse && !isEmpty(successResponse)
    if (!loggedIn) {
      return
    }

    return fetchAndStorePreferences(entityServiceContext.preferencesService, setters)
      .then(() => {
        setAuthState((_authState) => {
          return {
            ..._authState,
            loggedIn: true,
            user: successResponse
          }
        })
        setLoginDialogOpen(false)
        setSessionExpired(false)
        authServiceContext.sessionExpiredNotifier.reset()
        setStartPollingTrigger(uuid())
      })
      .catch((error) => {
        return logout()
          .catch((logoutError) => console.error('Failed to logout after preferences load failure:', logoutError))
          .then(() => {
            throw error
          })
      })
  }

  const closeLoggedOutDialog = () => {
    setLoggedOutDialogOpen(false)
    logout().finally(() => {
      navigate([])
    })
  }

  return (
    <>
      {!authState?.loggedIn && (
        <ListItemButton onClick={openLoginDialog}>
          <ListItemText primary={`Login`} sx={{ color: (theme) => theme.palette.getContrastText(theme.palette.background.default) }} />
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
