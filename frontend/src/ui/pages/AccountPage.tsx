import { Box, Divider, IconButton, InputAdornment, styled, TextField, Typography } from '@mui/material'

import { useAtom, useSetAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import omit from 'lodash/omit'
import { LoadingButton } from '@mui/lab'
import SendIcon from '@mui/icons-material/Send'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import UserCreationDates from 'ui/blocks/UserCreationDates'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { useDefaultPage } from 'ui/shared/hooks/useDefaultPage'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import PageSection from 'ui/shared/ui/PageSection'
import { unixtimeNow } from '@hatsuportal/common'
import { InputLimits } from '@hatsuportal/contracts'
import Panel from 'ui/shared/ui/Panel/Panel'
import { useSize } from 'ui/shared/hooks/useSize'

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& label': {
    color: theme.palette.getContrastText(theme.palette.background.default)
  },
  '& .MuiInputBase-root': {
    color: theme.palette.getContrastText(theme.palette.background.default)
  },
  '& .MuiFilledInput-underline:before': {
    borderBottom: `1px solid ${theme.palette.getContrastText(theme.palette.background.default)}`
  },
  '& .MuiFilledInput-underline:hover:before': {
    borderBottom: `1px solid ${theme.palette.primary.main}`
  },
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    border: `1px solid ${theme.palette.getContrastText(theme.palette.background.default)}`
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    border: `1px solid ${theme.palette.primary.main}`
  }
}))

const AccountPage: React.FC = () => {
  const entityServiceContext = useEntityServiceContext()
  const [authState, setAuthState] = useAtom(authAtom)
  const setError = useSetAtom(errorAtom)
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

  const { isSmall } = useSize()

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
          const fetchedUser = await entityServiceContext.userService.findById(authState.user?.id)
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
        ...omit(user, 'id', 'roles', 'createdAt', 'updatedAt')
      }
      // TODO, pass abortcontroller signal to update options?
      entityServiceContext.userService
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
        oldPassword: changePassword.oldPassword,
        newPassword: changePassword.newPassword
      }
      entityServiceContext.userService
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
        color: (theme) => theme.palette.getContrastText(theme.palette.background.default),
        gap: '1.5em',
        '& > .MuiTextField-root': {
          width: 'inherit'
        }
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontSize: '0.6em', color: (theme) => theme.palette.info.main, opacity: 0.4, padding: '0 0 0 0.5em' }}
      >
        id {`{ ${user.id} }`}
      </Typography>

      <Panel>
        <StyledTextField
          id="name"
          color="secondary"
          value={user.name}
          label="Name"
          onChange={onChangeName}
          variant="filled"
          inputProps={{ maxLength: InputLimits.userName }}
          InputLabelProps={{
            shrink: true
          }}
          sx={{ width: '100%' }}
        />
      </Panel>

      <Panel>
        <StyledTextField
          id="email"
          color="secondary"
          value={user.email}
          label="Email"
          onChange={onChangeEmail}
          variant="filled"
          InputLabelProps={{
            shrink: true
          }}
          sx={{ width: '100%' }}
        />
      </Panel>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LoadingButton
            onClick={onUpdateUser}
            endIcon={<SendIcon />}
            loading={loadingUserUpdate}
            disabled={!userChanged && !saveFailed}
            loadingPosition="end"
            variant="contained"
            sx={{
              margin: '0 1em 0 0'
            }}
          >
            <span>Update Account</span>
          </LoadingButton>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              margin: '0 0 0 3em',
              color: (theme) => theme.palette.getContrastText(theme.palette.success.main),
              height: '1em'
            }}
          >
            {userUpdateSuccess ? 'Account updated succesfully.' : ''}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ width: '100%', borderBottomWidth: 'medium' }} />

      <Panel
        sx={{
          flexDirection: 'column'
        }}
      >
        <Typography variant="h4" sx={{ margin: '0 0 1em 0' }}>
          Change Password
        </Typography>
        <StyledTextField
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
            margin: isSmall ? '0' : '0 0 .5em .5em'
          }}
        />
        <StyledTextField
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
            margin: isSmall ? '0' : '0 0 0 3em'
          }}
        />
        <StyledTextField
          id="new-password-confirmation"
          color="secondary"
          type={showPasswordConfirmation ? 'text' : 'password'}
          value={changePassword.newPasswordConfirmation}
          label="Confirm new password"
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
            margin: isSmall ? '0' : '0 0 0 3em'
          }}
        />
      </Panel>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LoadingButton
            onClick={onChangePassword}
            endIcon={<SendIcon />}
            loading={loadingPasswordChange}
            disabled={!passwordChanged}
            loadingPosition="end"
            variant="contained"
            sx={{
              margin: '0 1em 0 0'
            }}
          >
            <span>Change Password</span>
          </LoadingButton>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              margin: '0 0 0 11em',
              color: (theme) => theme.palette.getContrastText(theme.palette.success.main),
              height: '1em'
            }}
          >
            {passwordChangeSuccess ? 'Password changed succesfully.' : ''}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ width: '100%', borderBottomWidth: 'medium' }} />

      <UserCreationDates user={authState.user} />
    </PageSection>
  )
}

export default AccountPage
