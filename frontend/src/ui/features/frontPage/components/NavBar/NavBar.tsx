import {
  AppBar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar
} from '@mui/material'
import React from 'react'
import AppsIcon from '@mui/icons-material/Apps'
import MenuIcon from '@mui/icons-material/Menu'
import Login from 'ui/features/user/components/Login'
import {
  AccountBox,
  AddBoxOutlined,
  ExpandLess,
  ExpandMore,
  LocalLibraryOutlined,
  Logout,
  Person,
  ReorderOutlined
} from '@mui/icons-material'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'
import { useAuthServiceContext } from 'infrastructure/hooks/useAuthServiceContext'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import useOrientation from 'ui/shared/hooks/useOrientation'
import ListItemLink from 'ui/shared/components/ListItemLink'
import Breadcrumbs from 'ui/shared/components/Breadcrumbs'
import ColorModeSwitch from 'ui/shared/components/ColorModeSwitch'

const drawerWidth = 240

const NavBar: React.FC = () => {
  const authServiceContext = useAuthServiceContext()
  const navigate = useNavigate()

  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'

  const [isClosing, setIsClosing] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(!isPortrait)

  const [authState, setAuthState] = useAtom(authAtom)

  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const handleUserMenuClick = () => {
    setUserMenuOpen(!userMenuOpen)
  }
  const [storiesMenuOpen, setStoriesMenuOpen] = React.useState(false)
  const handleStoriesMenuClick = () => {
    setStoriesMenuOpen(!storiesMenuOpen)
  }

  const onLogout = () => {
    authServiceContext.authService.logout().finally(() => {
      setAuthState(() => {
        return {
          loggedIn: false,
          user: undefined
        }
      })
      navigate([])
    })
  }

  const handleDrawerClose = () => {
    setIsClosing(true)
    setMobileOpen(false)
  }

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false)
  }

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Toolbar />
      <Divider />
      <List>
        {authState.loggedIn && (
          <>
            <ListItemButton onClick={handleUserMenuClick}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Person fontSize="small" color="info" />
              </ListItemIcon>
              <ListItemText primary="User Menu" />
              {userMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={userMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding sx={{ pl: 2 }}>
                  <ListItemLink
                    IconProps={{ sx: { minWidth: 30 } }}
                    to="/profile"
                    primary="Profile"
                    icon={<Person fontSize="small" color="info" />}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pl: 2 }}>
                  <ListItemLink
                    IconProps={{ sx: { minWidth: 30 } }}
                    to="/account"
                    primary="My account"
                    icon={<AccountBox fontSize="small" color="info" />}
                  />
                </ListItem>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => {
                    onLogout()
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Logout fontSize="small" color="info" />
                  </ListItemIcon>
                  <ListItemText primary={`Logout ${authState.user?.name}`} />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}
        {/*The Login component needs to be always mounted, so it can poll the refresh token */}

        <Login />
      </List>
      <Divider />
      <List>
        {authState.loggedIn ? (
          <>
            <ListItemButton onClick={handleStoriesMenuClick}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <LocalLibraryOutlined fontSize="small" color="info" />
              </ListItemIcon>
              <ListItemText primary="Stories" />
              {storiesMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={storiesMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding sx={{ pl: 2 }}>
                  <ListItemLink
                    IconProps={{ sx: { minWidth: 30 } }}
                    to="/stories"
                    primary="Stories"
                    icon={<ReorderOutlined fontSize="small" color="info" />}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pl: 2 }}>
                  <ListItemLink
                    IconProps={{ sx: { minWidth: 30 } }}
                    to="/mystories"
                    primary="My Stories"
                    icon={<AppsIcon fontSize="small" color="info" />}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pl: 2 }}>
                  <ListItemLink
                    IconProps={{ sx: { minWidth: 30 } }}
                    to="/story"
                    primary="Create Story"
                    icon={<AddBoxOutlined fontSize="small" color="info" />}
                  />
                </ListItem>
              </List>
            </Collapse>
          </>
        ) : (
          <List component="div" disablePadding>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <ListItemLink
                IconProps={{ sx: { minWidth: 30 } }}
                to="/stories"
                primary="Stories"
                icon={<ReorderOutlined fontSize="small" color="info" />}
              />
            </ListItem>
          </List>
        )}
      </List>
      <ColorModeSwitch />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          width: isPortrait ? '100%' : `calc(100% - ${drawerWidth}px)`,
          ml: !isPortrait ? '0' : `${drawerWidth}px`,
          backgroundImage: 'none'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: isPortrait ? 'block' : 'none' }}
          >
            <MenuIcon />
          </IconButton>
          <Breadcrumbs />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: !isPortrait ? drawerWidth : '100%',
          flexShrink: !isPortrait ? 0 : 'auto',
          backgroundColor: (theme) => theme.palette.primary.main
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          sx={{
            display: isPortrait ? 'block' : 'none',
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: isPortrait ? 'none' : 'block',
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  )
}

export default NavBar
