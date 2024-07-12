import { Box } from '@mui/material'
import React, { useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

import LoadingIndicator from 'components/LoadingIndicator'
import { useOrientation } from 'utils/hooks'

import ErrorDisplay from 'components/ErrorDisplay'
import ErrorFallback from 'components/ErrorFallback'

import NavBar from 'components/NavBar'
import AccountPage from 'pages/AccountPage'
import ProfilePage from 'pages/PorfilePage'
import ItemsPage from 'pages/ItemsPage'
import FrontPage from 'pages/FrontPage'
import SuccessDisplay from 'components/SuccessDisplay'
import MyItemsPage from 'pages/MyItemsPage'
import Theme from 'components/Theme'

const App: React.FC = () => {
  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'

  useEffect(() => {
    console.log('window.location.pathname', window.location.pathname)
  }, [window.location.pathname])

  const Main = () => {
    return (
      <Theme>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isPortrait ? 'column' : 'row',
            minHeight: '100dvh',
            height: '100%'
          }}
        >
          <React.Suspense fallback={<LoadingIndicator />}>
            <NavBar />
          </React.Suspense>
          <Box
            component="main"
            sx={{
              overflowAnchor: 'none',
              boxShadow: 'rgb(0, 0, 0) 2px 0px 7px -5px inset',
              minHeight: '100%',
              width: '100%',
              flex: isPortrait ? '1 1 auto' : '',
              display: isPortrait ? 'flex' : '',
              flexDirection: 'column'
            }}
          >
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <React.Suspense fallback={<LoadingIndicator />}>
                <Outlet />
                <ErrorDisplay />
                <SuccessDisplay />
              </React.Suspense>
            </ErrorBoundary>
          </Box>
        </Box>
      </Theme>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Main />}>
        <Route index element={<FrontPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="myitems" element={<MyItemsPage />} />

        {/* Using path="*"" means "match anything", so this route
                    acts like a catch-all for URLs that we don't have explicit
                    routes for. */}
        <Route path="*" element={<FrontPage />} />
      </Route>
    </Routes>
  )
}

export default App
