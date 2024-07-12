import React, { useState } from 'react'
import {
  Button,
  LinearProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import Dialog from 'components/Dialog'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { login } from 'api/auth'
import { UserResponseDTO } from '@hatsuportal/application'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
  onLoginSuccess: (response: UserResponseDTO) => void // Adjust the type as needed
}

const LoginDialog: React.FC<LoginDialogProps> = (props) => {
  const { open, onClose, onLoginSuccess } = props
  const [userState, setUserState] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const closeLoginDialog = () => {
    onClose()
  }

  const toggleShowPassword = () => {
    setShowPassword((_showPassword) => !_showPassword)
  }

  const onChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setError('')
    setUserState((_userState) => {
      return {
        ..._userState,
        username: value
      }
    })
  }

  const onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setError('')
    setUserState((_userState) => {
      return {
        ..._userState,
        password: value
      }
    })
  }

  const handleLogin = () => {
    if (!userState.username && !userState.password) {
      setError('Fill username and password')
    } else {
      setLoading(true)
      login({ username: userState.username, password: userState.password })
        .then((response) => {
          setLoading(false)
          onLoginSuccess(response)
        })
        .catch((error: any) => {
          setLoading(false)
          setError(error.message)
        })
    }
  }

  return (
    <Dialog
      onKeyUp={(e) => {
        const ENTER = 13
        if (e.keyCode === ENTER) {
          handleLogin()
        }
      }}
      open={open}
      PaperProps={{}}
    >
      <DialogTitle
        sx={{
          paddingBottom: '0.5em'
        }}
      >
        HatsuPortal Login
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2.2em',
          '&&': {
            paddingTop: '20px'
          }
        }}
      >
        {error && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold'
            }}
          >
            {error}
          </Typography>
        )}
        <TextField
          variant="outlined"
          label="Username"
          error={!!error}
          disabled={loading}
          id="login-username"
          value={userState.username}
          onChange={onChangeUsername}
          InputLabelProps={{
            shrink: true,
            sx: {
              fontSize: '1.4em',
              transform: 'translate(2px, -22px) scale(0.75)'
            }
          }}
        />
        <TextField
          variant="outlined"
          label="Password"
          error={!!error}
          disabled={loading}
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          value={userState.password}
          onChange={onChangePassword}
          InputLabelProps={{
            shrink: true,
            sx: {
              fontSize: '1.4em',
              transform: 'translate(2px, -22px) scale(0.75)'
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="Toggle password visibility" onClick={toggleShowPassword}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        {loading && <LinearProgress color="secondary" />}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={closeLoginDialog} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleLogin} disabled={loading}>
          Login
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LoginDialog
