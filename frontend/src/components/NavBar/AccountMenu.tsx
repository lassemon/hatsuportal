import { AccountBox, AccountCircle, Logout, Person } from '@mui/icons-material'
import AppsIcon from '@mui/icons-material/Apps'
import { Button, Divider, Menu, MenuItem, Typography } from '@mui/material'
import { logout } from 'api/auth'
import { authAtom } from 'infrastructure/dataAccess/atoms'
import { useAtom } from 'jotai'
import React from 'react'
import { Link } from 'react-router-dom'
import { useOrientation } from 'utils/hooks'

export const AccountMenu: React.FC = () => {
  const [authState, setAuthState] = useAtom(authAtom)
  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'

  const [userMenuAnchorElement, setUserMenuAnchorElement] = React.useState<null | HTMLElement>(null)
  const userMenuOpen = Boolean(userMenuAnchorElement)

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorElement(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchorElement(null)
  }

  const onLogout = () => {
    logout().finally(() => {
      setAuthState(() => {
        return {
          loggedIn: false,
          user: undefined
        }
      })
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        width: isPortrait ? '' : '100%',
        justifyContent: 'center',
        position: isPortrait ? 'absolute' : 'static',
        top: '1em',
        right: '1em'
      }}
    >
      {authState?.loggedIn && (
        <>
          <Button
            size="large"
            onClick={handleUserMenu}
            color="inherit"
            sx={{
              padding: '0.9em 0.5em',
              color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
            }}
            fullWidth={isPortrait ? false : true}
            startIcon={<AccountCircle />}
          >
            <Typography
              component="span"
              variant="body1"
              sx={{
                fontSize: '1.4rem',
                lineHeight: '1.4rem',
                textTransform: 'none',
                color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
              }}
            >
              {authState.user?.name}
            </Typography>
          </Button>

          <Menu
            id="menu-appbar"
            elevation={1}
            anchorEl={userMenuAnchorElement}
            keepMounted
            anchorOrigin={{
              vertical: isPortrait ? 'bottom' : 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            slotProps={{
              paper: {
                sx: {
                  '& .MuiList-root': {
                    padding: 0
                  }
                }
              }
            }}
          >
            <Link
              to="/profile"
              onClick={() => {
                handleUserMenuClose()
              }}
              style={{ color: 'inherit', textDecoration: 'inherit' }}
            >
              <MenuItem
                sx={{ gap: '1em', padding: '0.7em 1em', color: (theme) => theme.palette.getContrastText(theme.palette.background.paper) }}
              >
                <Person fontSize="small" color="info" /> Profile
              </MenuItem>
            </Link>
            <Link
              to="/account"
              onClick={() => {
                handleUserMenuClose()
              }}
              style={{ color: 'inherit', textDecoration: 'inherit' }}
            >
              <MenuItem
                sx={{ gap: '1em', padding: '0.7em 1em', color: (theme) => theme.palette.getContrastText(theme.palette.background.paper) }}
              >
                <AccountBox fontSize="small" color="info" /> My account
              </MenuItem>
            </Link>

            <Divider />
            <Link
              to="/myitems"
              onClick={() => {
                handleUserMenuClose()
              }}
              style={{ color: 'inherit', textDecoration: 'inherit' }}
            >
              <MenuItem
                sx={{ gap: '1em', padding: '0.7em 1em', color: (theme) => theme.palette.getContrastText(theme.palette.background.paper) }}
              >
                <AppsIcon fontSize="small" color="info" /> My Items
              </MenuItem>
            </Link>
            <Divider />
            <MenuItem
              onClick={() => {
                handleUserMenuClose()
                onLogout()
              }}
              sx={{ gap: '1em', padding: '0.7em 1em', color: (theme) => theme.palette.getContrastText(theme.palette.background.paper) }}
            >
              <Logout fontSize="small" /> Logout {authState.user?.name}
            </MenuItem>
          </Menu>
        </>
      )}
    </div>
  )
}

export default AccountMenu
