import { Divider, IconButton, InputAdornment, TextField, Typography } from '@mui/material'

import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { LoadingButton } from '@mui/lab'
import SendIcon from '@mui/icons-material/Send'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import UserCreationDates from 'ui/features/user/components/UserCreationDates'
import { authAtom } from 'ui/state/authAtom'
import { errorAtom } from 'ui/state/errorAtom'
import { useDefaultPage } from 'ui/shared/hooks/useDefaultPage'
import { useDataServiceContext } from 'infrastructure/hooks/useDataServiceContext'
import PageSection from 'ui/shared/components/PageSection'
import { unixtimeNow } from '@hatsuportal/common'

const AccountPage: React.FC = () => {
  const dataServiceContext = useDataServiceContext()
  const [authState, setAuthState] = useAtom(authAtom)
  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))
  const [user, setUser] = useState(authState.user)
  const [changePassword, setChangePassword] = useState({
    oldPassword: '',
    newPassword: '',
    newPasswordConfirmation: '',
    error: false,
    oldPasswordError: false
  })
  useDefaultPage(!authState.loggedIn)

  const [userChanged, setUserChanged] = useState(JSON.stringify(user) !== JSON.stringify(authState.user))
  const [saveFailed, setSaveFailed] = useState(userChanged)
  const passwordChanged = changePassword.newPassword !== '' || changePassword.newPasswordConfirmation !== ''

  const [userUpdateSuccess, setUserUpdateSuccess] = useState(false)
  const [loadingUserUpdate, setLoadingUserUpdate] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
  const [loadingPasswordChange, setLoadingPasswordChange] = useState(false)

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const toggleShowNewPassword = () => {
    setShowNewPassword((_showPassword) => !_showPassword)
  }

  const toggleShowPasswordConfirmation = () => {
    setShowPasswordConfirmation((_showPassword) => !_showPassword)
  }

  const resetUiIndicators = () => {
    setSaveFailed(false)
    setLoadingPasswordChange(false)
    setLoadingUserUpdate(false)
    setPasswordChangeSuccess(false)
    setUserUpdateSuccess(false)
  }

  useEffect(() => {
    setUserChanged(JSON.stringify(user) !== JSON.stringify(authState.user))
  }, [user, authState.user])

  useEffect(() => {
    setUser(authState.user)
  }, [authState.user])

  useEffect(() => {
    const fetchAndSetUser = async () => {
      if (authState.user)
        try {
          // TODO use abortcontroller pattern here with unmounting useEffect
          const fetchedUser = await dataServiceContext.userService.findById(authState.user?.id)
          setAuthState((_authState) => {
            return {
              ..._authState,
              user: fetchedUser.toJSON()
            }
          })
        } catch (error) {
          console.error('Failed to fetch user:', error)
        }
    }

    if (authState.loggedIn) {
      fetchAndSetUser()
    }
  }, [])

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    resetUiIndicators()
    setUser((_user) => {
      if (_user) {
        return { ..._user, name: event.target.value, updatedAt: unixtimeNow() }
      }
      return _user
    })
  }

  const onChangeEmail = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    resetUiIndicators()
    setChangePassword((_changePassword) => {
      return { ..._changePassword, error: false }
    })
    setUser((_user) => {
      if (_user) {
        return { ..._user, email: event.target.value, updatedAt: unixtimeNow() }
      }
      return _user
    })
  }

  const onUpdateUser = () => {
    if (user) {
      resetUiIndicators()
      setLoadingUserUpdate(true)
      setError(null)
      const userUpdate = {
        ..._.omit(user, 'roles', 'createdAt', 'updatedAt')
      }
      // TODO, pass abortcontroller signal to update options?
      dataServiceContext.userService
        .update(user.id, userUpdate)
        .then((persistedUser) => {
          setAuthState((_authState) => {
            const newAuthState = {
              ..._authState,
              user: persistedUser.toJSON()
            }
            return newAuthState
          })
          setSaveFailed(false)
          setUserUpdateSuccess(true)
        })
        .catch((error) => {
          setSaveFailed(true)
          setError(error)
        })
        .finally(() => {
          setLoadingUserUpdate(false)
        })
    }
  }

  const onChangePassword = () => {
    if (user && validatePasswordChange()) {
      resetUiIndicators()
      setLoadingPasswordChange(true)
      setError(null)
      setChangePassword((_changePassword) => {
        return { ..._changePassword, newPassword: '', newPasswordConfirmation: '', oldPassword: '' }
      })
      const passwordUpdate = {
        id: authState.user?.id!, // user in this page is never undefined, TODO, use user.id instead?
        oldPassword: changePassword.oldPassword,
        newPassword: changePassword.newPassword
      }
      dataServiceContext.userService
        .update(user.id, passwordUpdate)
        .then(() => {
          setPasswordChangeSuccess(true)
        })
        .catch((error) => {
          if (error.status === 401) {
            setChangePassword((_changePassword) => {
              return { ..._changePassword, oldPasswordError: true }
            })
          }
          setError(error)
        })
        .finally(() => {
          setLoadingPasswordChange(false)
        })
    }
  }

  const validatePasswordChange = () => {
    const oldPasswordEmpty = changePassword.oldPassword === ''
    if (oldPasswordEmpty) {
      setChangePassword((_changePassword) => {
        return { ..._changePassword, oldPasswordError: true }
      })
      return
    }
    if (changePassword.newPassword) {
      const passwordMatchesConfirmation = changePassword.newPassword === changePassword.newPasswordConfirmation
      if (!passwordMatchesConfirmation) {
        setChangePassword((_changePassword) => {
          return { ..._changePassword, error: true }
        })
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  const onChangeOldPasswordField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    resetUiIndicators()
    setChangePassword((_changePassword) => {
      return { ..._changePassword, oldPasswordError: false }
    })
    setChangePassword((_changePassword) => {
      return {
        ..._changePassword,
        oldPassword: event.target.value
      }
    })
  }

  const onChangeNewPasswordField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    resetUiIndicators()
    setChangePassword((_changePassword) => {
      return { ..._changePassword, error: false }
    })
    setChangePassword((_changePassword) => {
      return {
        ..._changePassword,
        newPassword: event.target.value
      }
    })
  }

  const onChangeNewPasswordConfirmationField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    resetUiIndicators()
    setChangePassword((_changePassword) => {
      return { ..._changePassword, error: false }
    })
    setChangePassword((_changePassword) => {
      return {
        ..._changePassword,
        newPasswordConfirmation: event.target.value
      }
    })
  }

  if (!user) {
    return null
  }

  return (
    <PageSection
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignStories: 'flex-start',
        gap: '1.5em',
        '& > .MuiTextField-root': {
          width: 'inherit'
        }
      }}
    >
      <Typography variant="body2" sx={{ color: (theme) => theme.palette.info.main }}>
        id {`{ ${user.id} }`}
      </Typography>

      <TextField
        id="name"
        color="secondary"
        value={user.name}
        label="Name"
        onChange={onChangeName}
        variant="filled"
        InputLabelProps={{
          shrink: true
        }}
        sx={{}}
      />

      <TextField
        id="email"
        color="secondary"
        value={user.email}
        label="Email"
        onChange={onChangeEmail}
        variant="filled"
        InputLabelProps={{
          shrink: true
        }}
        sx={{}}
      />

      <div>
        <LoadingButton
          onClick={onUpdateUser}
          endIcon={<SendIcon />}
          loading={loadingUserUpdate}
          disabled={!userChanged && !saveFailed}
          loadingPosition="end"
          variant="contained"
        >
          <span>Update Account</span>
        </LoadingButton>
        {userUpdateSuccess && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              margin: '0 0 0 3em',
              color: (theme) => theme.palette.info.main
            }}
          >
            Account updated succesfully.
          </Typography>
        )}
      </div>

      <Divider sx={{ width: '100%', borderBottomWidth: 'medium' }} />

      <TextField
        id="old-password"
        color="secondary"
        value={changePassword.oldPassword}
        type="password"
        label="Old password"
        onChange={onChangeOldPasswordField}
        variant="outlined"
        size="small"
        InputLabelProps={{
          shrink: true
        }}
        error={changePassword.oldPasswordError}
        helperText={changePassword.oldPasswordError ? 'Required field.' : ''}
        sx={{
          margin: '0 0 .5em .5em'
        }}
      />
      <TextField
        id="new-password"
        color="secondary"
        type={showNewPassword ? 'text' : 'password'}
        value={changePassword.newPassword}
        label="New password"
        onChange={onChangeNewPasswordField}
        variant="outlined"
        size="small"
        InputLabelProps={{
          shrink: true
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label="Toggle password visibility" onClick={toggleShowNewPassword}>
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
        error={changePassword.error}
        sx={{
          margin: '0 0 0 1em'
        }}
      />
      <TextField
        id="new-password-confirmation"
        color="secondary"
        type={showPasswordConfirmation ? 'text' : 'password'}
        value={changePassword.newPasswordConfirmation}
        label="Confirm password"
        onChange={onChangeNewPasswordConfirmationField}
        variant="outlined"
        size="small"
        InputLabelProps={{
          shrink: true
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label="Toggle password visibility" onClick={toggleShowPasswordConfirmation}>
                {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
        error={changePassword.error}
        helperText={changePassword.error ? 'Passwords do not match.' : ''}
        sx={{
          margin: '0 0 0 1em'
        }}
      />

      <div>
        <LoadingButton
          onClick={onChangePassword}
          endIcon={<SendIcon />}
          loading={loadingPasswordChange}
          disabled={!passwordChanged}
          loadingPosition="end"
          variant="contained"
          sx={{
            margin: '0 0 0 7em'
          }}
        >
          <span>Change Password</span>
        </LoadingButton>
        {passwordChangeSuccess && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              margin: '0 0 0 11em',
              color: (theme) => theme.palette.info.main
            }}
          >
            Password changed succesfully.
          </Typography>
        )}
      </div>

      <Divider sx={{ width: '100%', borderBottomWidth: 'medium' }} />

      <UserCreationDates user={authState.user} />
    </PageSection>
  )
}

export default AccountPage
