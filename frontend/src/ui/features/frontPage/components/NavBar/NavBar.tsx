import { AppBar, Avatar, Box, Divider, IconButton, Menu, Toolbar } from '@mui/material'
import React from 'react'
import Login from 'ui/features/user/components/Login'
import { AccountBox, AddBoxOutlined, Logout, Person } from '@mui/icons-material'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'
import { useAuthServiceContext } from 'infrastructure/hooks/useAuthServiceContext'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import Breadcrumbs from 'ui/shared/components/Breadcrumbs'
import ColorModeSwitch from 'ui/shared/components/ColorModeSwitch'
import { testAvatar } from 'ui/shared/testAvatar'
import MenuItemLink from 'ui/shared/components/MenuItemLink'
import AddButton from 'ui/shared/components/Buttons/AddButton'

const NavBar: React.FC = () => {
  const authServiceContext = useAuthServiceContext()
  const navigate = useNavigate()

  const [authState, setAuthState] = useAtom(authAtom)

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)
  const [anchorElAdd, setAnchorElAdd] = React.useState<null | HTMLElement>(null)

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }
  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }
  const handleOpenAddMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElAdd(event.currentTarget)
  }
  const handleCloseAddMenu = () => {
    setAnchorElAdd(null)
  }

  const onLogout = () => {
    authServiceContext.authService.logout().finally(() => {
      setAuthState(() => {
        return {
          loggedIn: false,
          user: undefined
        }
      })
      setAnchorElUser(null)
      setAnchorElAdd(null)
      navigate([])
    })
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          width: '100%',
          position: 'static',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '1.5em',
              color: (theme) => theme.palette.getContrastText(theme.palette.background.default)
            }}
          >
            <MenuItemLink IconProps={{ sx: { minWidth: 30 } }} to="/" text="Home" breadcrumbLabel={''} />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Breadcrumbs />
          {authState.loggedIn && (
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
              <AddButton
                onClick={handleOpenAddMenu}
                sx={{ color: (theme) => theme.palette.getContrastText(theme.palette.background.default) }}
              />
              <Menu
                sx={{ marginTop: '3em' }}
                id="menu-appbar"
                anchorEl={anchorElAdd}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                open={Boolean(anchorElAdd)}
                onClose={handleCloseAddMenu}
              >
                <MenuItemLink
                  IconProps={{ sx: { minWidth: 30 } }}
                  to="/story/create"
                  text="Create Story"
                  icon={<AddBoxOutlined fontSize="small" color="info" />}
                  onClick={handleCloseAddMenu}
                />
              </Menu>
              <IconButton sx={{ p: 0 }} onClick={handleOpenUserMenu}>
                <Avatar alt={authState.user?.name} src={`data:image/png;base64,${testAvatar}`} />
              </IconButton>
              <Menu
                sx={{ marginTop: '3em' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItemLink
                  IconProps={{ sx: { minWidth: 30 } }}
                  to="/profile"
                  text="Profile"
                  icon={<Person fontSize="small" color="info" />}
                  onClick={handleCloseUserMenu}
                />
                <MenuItemLink
                  IconProps={{ sx: { minWidth: 30 } }}
                  to="/account"
                  text="My account"
                  icon={<AccountBox fontSize="small" color="info" />}
                  onClick={handleCloseUserMenu}
                />
                <MenuItemLink
                  IconProps={{ sx: { minWidth: 30 } }}
                  to="/logout"
                  text={`Logout ${authState.user?.name}`}
                  icon={<Logout fontSize="small" color="info" />}
                  onClick={onLogout}
                />
              </Menu>
            </Box>
          )}
          <Box sx={{ marginLeft: 'auto', alignItems: 'center', gap: '0.5em', display: authState.loggedIn ? 'none' : 'flex' }}>
            <Login />
          </Box>
        </Toolbar>
      </AppBar>
      <ColorModeSwitch />
    </Box>
  )
}

export default NavBar
