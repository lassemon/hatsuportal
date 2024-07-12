import { AppBar, Box, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useOrientation } from 'utils/hooks'
import { Link } from 'react-router-dom'
import AccountMenu from './AccountMenu'
import LoginMenu from './LoginMenu'
import ColorModeSwitch from 'components/ColorModeSwitch/ColorModeSwitch'

const TABS = {
  '/items': 'Items'
} as { [key: string]: string }

const ToFrontPageLink: React.FC<{ clearTab: () => void }> = ({ clearTab }) => {
  return (
    <Link
      to="/"
      onClick={() => {
        clearTab()
      }}
      style={{ color: 'inherit', textDecoration: 'inherit' }}
    >
      <span
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1em 0 0 0',
          fontSize: '1.3em',
          gap: '0.6em'
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: '600', whiteSpace: 'nowrap' }}
          color={(theme) => theme.palette.getContrastText(theme.palette.background.paper)}
        >
          HatsuPortal
        </Typography>
      </span>
    </Link>
  )
}

const NavBar: React.FC = () => {
  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'

  const [tab, setTab] = useState<string | boolean>(Object.keys(TABS).includes(window.location.pathname) ? window.location.pathname : false)

  useEffect(() => {
    setTab(Object.keys(TABS).includes(window.location.pathname) ? window.location.pathname : false)
  }, [window.location.pathname])

  const handleTabChange = (event: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setTab(newValue)
  }

  const clearTab = () => {
    setTab(false)
  }

  return (
    <Box display="block" sx={{ boxShadow: 'rgb(0, 0, 0) 2px 0px 7px -5px' }}>
      <Box sx={{ position: 'relative', width: isPortrait ? '100%' : '185px' }}>
        <Box sx={{ width: isPortrait ? '100%' : '185px', height: isPortrait ? '' : '100dvh', position: isPortrait ? 'static' : 'static' }}>
          <AppBar
            position="static"
            elevation={0}
            color="inherit"
            sx={{
              margin: 0,
              width: isPortrait ? '100%' : '185px',
              height: isPortrait ? '100%' : '100%',
              flexDirection: isPortrait ? 'column-reverse' : 'column'
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                height: isPortrait ? '' : '100%',
                display: 'block',
                ...(isPortrait
                  ? {
                      justifyContent: 'center',
                      margin: '0',
                      gap: '1em',
                      padding: '0.5em 0'
                    }
                  : {
                      flexDirection: 'column',
                      gap: '1em'
                    })
              }}
            >
              <Box
                sx={{
                  color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
                }}
              >
                <ToFrontPageLink clearTab={clearTab} />
                <AccountMenu />
                <Tabs
                  textColor="inherit"
                  TabIndicatorProps={{
                    sx: {
                      backgroundColor: (theme) => theme.palette.info.main,
                      width: '4px',
                      height: '4px'
                    }
                  }}
                  value={tab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons={isPortrait ? 'auto' : false}
                  allowScrollButtonsMobile={isPortrait}
                  orientation={isPortrait ? 'horizontal' : 'vertical'}
                  sx={{
                    ...(isPortrait
                      ? { width: '100%', flexGrow: 1, minWidth: '170px' }
                      : { width: '185px', flexGrow: 1, minWidth: '170px', justifyContent: 'center' }),
                    '& .MuiTabs-flexContainer': {
                      justifyContent: 'center'
                    }
                  }}
                >
                  {Object.keys(TABS).map((tab) => {
                    return (
                      <Tab
                        label={TABS[tab]}
                        value={`${tab}`}
                        component={Link}
                        to={tab}
                        key={tab}
                        sx={{
                          padding: '0.7em',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      />
                    )
                  })}
                </Tabs>
                {!isPortrait && <LoginMenu />}
              </Box>
            </Toolbar>
            {isPortrait && <LoginMenu />}
            <ColorModeSwitch />
          </AppBar>
        </Box>
      </Box>
    </Box>
  )
}

export default NavBar
