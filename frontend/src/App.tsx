import { Box } from '@mui/material'
import React, { useState } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

import LoadingIndicator from 'presentation/components/LoadingIndicator'
import { useOrientation } from 'presentation/hooks/useOrientation'

import ErrorDisplay from 'presentation/components/ErrorDisplay'
import ErrorFallback from 'presentation/components/ErrorFallback'

import AccountPage from 'presentation/pages/AccountPage'
import ProfilePage from 'presentation/pages/ProfilePage'
import AllStoriesPage from 'presentation/pages/AllStoriesPage'
import FrontPage from 'presentation/pages/FrontPage'
import SuccessDisplay from 'presentation/components/SuccessDisplay'
import MyStoriesPage from 'presentation/pages/MyStoriesPage'
import Theme from 'presentation/components/Theme'
import {
  AuthServiceContext,
  DataServiceContext,
  UtilityServiceContext,
  DataServiceFactory,
  HttpClient,
  LocalStorageStoryService,
  LocalStorageService,
  ImageProcessingService
} from 'infrastructure'
import {
  ImagePresentationMapper,
  StoryPresentationMapper,
  ProfilePresentationMapper,
  UserPresentationMapper,
  StoryPresentationDTO
} from '@hatsuportal/presentation'
import { HttpClientFactory } from 'infrastructure/services/HttpClientFactory'
import { IAuthServiceContext, IDataServiceContext, IUtilityServiceContext } from 'application'
import { AuthService } from 'infrastructure/services/auth/AuthService'
import EditStoryLayout from 'presentation/layouts/EditStoryLayout'
import NavBar from 'presentation/components/NavBar/NavBar'
import CreateStoryLayout from 'presentation/layouts/CreateStoryLayout'
import StoryPage from 'presentation/pages/StoryPage/StoryPage'

const httpClientFactory = new HttpClientFactory(new HttpClient())

const authService = new AuthService(httpClientFactory.createAuthHttpClient(), new UserPresentationMapper())
const localStorageStoryService = new LocalStorageStoryService(new LocalStorageService<StoryPresentationDTO>())

export const utilityServiceContext: IUtilityServiceContext = {
  imageProcessingService: new ImageProcessingService()
}

const serviceFactory = new DataServiceFactory(
  httpClientFactory,
  new UserPresentationMapper(),
  new StoryPresentationMapper(new ImagePresentationMapper()),
  new ImagePresentationMapper(),
  new ProfilePresentationMapper(),
  localStorageStoryService
)

export const authServiceContext: IAuthServiceContext = {
  authService: authService
}

export const dataServiceContext: IDataServiceContext = {
  userService: serviceFactory.createUserService(),
  storyService: serviceFactory.createStoryService(),
  profileService: serviceFactory.createProfileService(),
  imageService: serviceFactory.createImageService()
}

export const AppProviders: React.FC = ({ children }) => {
  const [authContext] = useState<IAuthServiceContext>(authServiceContext)
  const [dataContext] = useState<IDataServiceContext>(dataServiceContext)
  const [utilityContext] = useState<IUtilityServiceContext>(utilityServiceContext)

  return (
    <AuthServiceContext.Provider value={authContext}>
      <DataServiceContext.Provider value={dataContext}>
        <UtilityServiceContext.Provider value={utilityContext}>{children}</UtilityServiceContext.Provider>
      </DataServiceContext.Provider>
    </AuthServiceContext.Provider>
  )
}

const App: React.FC = () => {
  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'

  const Main = () => {
    return (
      <AppProviders>
        <Theme>
          <Box
            sx={{
              display: 'flex',
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
                marginTop: '64px',
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
      </AppProviders>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Main />}>
        <Route index element={<FrontPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="stories" element={<AllStoriesPage />} />
        <Route path="mystories" element={<MyStoriesPage />} />

        <Route path="story" element={<StoryPage />} />
        <Route path="story/:storyId" element={<StoryPage />} />
        {/* Using path="*"" means "match anything", so this route
                    acts like a catch-all for URLs that we don't have explicit
                    routes for. */}
        <Route path="*" element={<FrontPage />} />
      </Route>
    </Routes>
  )
}

export default App
