import { AppBar, Avatar, Box, IconButton, Menu, MenuItem, Tab, Tabs, Toolbar } from '@mui/material'
import React from 'react'
import Login from 'ui/features/login/ui/Login'
import { AccountBox, AddBoxOutlined, Logout, Person } from '@mui/icons-material'
import { useAtomValue, useSetAtom } from 'jotai'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import Breadcrumbs from 'ui/shared/ui/Breadcrumbs'
import { defaultAvatarMale } from 'ui/shared/util/defaultAvatarMale'
import MenuItemLink from 'ui/shared/ui/MenuItemLink'
import AddButton from 'ui/shared/ui/Buttons/AddButton'
import { useLogout } from 'ui/entities/user/hooks/useLogout'
import { useSize } from 'ui/shared/hooks/useSize'
import { HomeButton } from 'ui/shared/ui/Buttons/HomeButton'
import { SearchBox } from 'ui/shared/ui/SearchBox'
import { Link, useLocation } from 'react-router-dom'
import { breadcrumbAtom } from 'ui/shared/state/breadcrumbAtom'
import MoreVerticalIcon from '@mui/icons-material/MoreVert'

const pages = [
  {
    name: 'Posts',
    path: '/posts'
  },
  {
    name: 'Themes',
    path: '/themes'
  }
]

const NavBar: React.FC = () => {
  const navigate = useNavigate()
  const { logout } = useLogout()

  const { isTiny, isSmall } = useSize()

  const authState = useAtomValue(authAtom)

  const location = useLocation()
  const setBreadcrumbs = useSetAtom(breadcrumbAtom)

  const tabValue = pages.find((page) => location.pathname === page.path || location.pathname.startsWith(`${page.path}/`))?.path ?? false

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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const contentMenuOpen = Boolean(anchorEl)
  const handleContentMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleContentMenuItemClick = (page: (typeof pages)[number]) => {
    navigate([{ href: page.path, label: page.name }])
    handleContentMenuClose()
  }
  const handleContentMenuClose = () => {
    setAnchorEl(null)
  }

  const onLogout = () => {
    logout().finally(() => {
      setAnchorElUser(null)
      setAnchorElAdd(null)
      navigate([])
    })
  }

  const onHome = () => {
    navigate([])
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.getContrastText(theme.palette.background.default),
          width: '100%',
          position: 'static',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            padding: isTiny ? '0.5em' : '0 1.5em 0 0',
            justifyContent: 'flex-start'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              margin: isSmall ? '0' : '0 0.5em',
              color: (theme) => theme.palette.getContrastText(theme.palette.background.default)
            }}
          >
            <HomeButton onClick={onHome} />
          </Box>
          {!isSmall && <Breadcrumbs />}
          {authState.loggedIn && (
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', width: isTiny ? '100%' : 'auto' }}>
              {isTiny ? (
                <>
                  <IconButton onClick={handleContentMenuClick} sx={{ marginRight: 'auto' }}>
                    <MoreVerticalIcon />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={contentMenuOpen} onClose={handleContentMenuClose}>
                    {pages.map((page) => (
                      <MenuItem key={page.path} selected={page.path === tabValue} onClick={() => handleContentMenuItemClick(page)}>
                        {page.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Tabs
                  value={tabValue}
                  variant="scrollable"
                  TabIndicatorProps={{ sx: { display: 'none' } }}
                  sx={{
                    '& .MuiTab-root': { minWidth: 'auto' },
                    '& .MuiTab-root:not(:last-child)': { position: 'relative' },
                    '& .MuiTab-root:not(:last-child):after': {
                      content: `''`,
                      position: 'absolute',
                      right: 0,
                      height: '60%',
                      width: '1px',
                      background: (theme) => theme.palette.divider
                    }
                  }}
                >
                  {pages.map((page) => (
                    <Tab
                      key={page.path}
                      component={Link}
                      to={page.path}
                      value={page.path}
                      label={page.name}
                      onClick={() => setBreadcrumbs([{ href: page.path, label: page.name }])}
                      disableRipple
                    />
                  ))}
                </Tabs>
              )}
              <AddButton
                onClick={handleOpenAddMenu}
                sx={{
                  color: (theme) => theme.palette.getContrastText(theme.palette.background.default),
                  padding: (theme) => theme.spacing(0.5)
                }}
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
                <MenuItemLink
                  IconProps={{ sx: { minWidth: 30 } }}
                  to="/theme/create"
                  text="Create Theme"
                  icon={<AddBoxOutlined fontSize="small" color="info" />}
                  onClick={handleCloseAddMenu}
                />
              </Menu>
              <SearchBox />
              <IconButton sx={{ padding: 0, marginLeft: '0.5em' }} onClick={handleOpenUserMenu}>
                <Avatar alt={authState.user?.name} src={`data:image/png;base64,${defaultAvatarMale}`} />
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
    </Box>
  )
}

export default NavBar
