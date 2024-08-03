import { Box, useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

import { IAuthServiceContext, IEntityServiceContext, IUtilityServiceContext } from 'application/interfaces'
import ErrorDisplay from 'ui/shared/ui/ErrorDisplay'
import ErrorFallback from 'ui/shared/ui/ErrorFallback'
import NavBar from 'ui/blocks/NavBar'
import { StoryViewModelDTO } from 'ui/entities/story/model/StoryViewModel'
import { AuthStateDTO } from 'ui/app/state/authAtom'
import { IStorageServiceContext } from 'application/interfaces/context/IStorageServiceContext'
import { Breadcrumb } from 'ui/shared/state/breadcrumbAtom'
import { HttpClientFactory } from 'infrastructure/services/HttpClientFactory'
import { HttpClient } from 'infrastructure/http/clients/HttpClient'
import { UserViewModelMapper } from 'infrastructure/http/mappers/UserViewModelMapper'
import { AuthService } from 'infrastructure/services/auth/AuthService'
import { LocalStorageService } from 'infrastructure/services/storage/LocalStorageService'
import { ImageProcessingService } from 'infrastructure/services/imageProcessing/ImageProcessingService'
import { DataServiceFactory } from 'infrastructure/services/DataServiceFactory'
import { StoryViewModelMapper } from 'infrastructure/http/mappers/StoryViewModelMapper'
import { ImageViewModelMapper } from 'infrastructure/http/mappers/ImageViewModelMapper'
import { ProfileViewModelMapper } from 'infrastructure/http/mappers/ProfileViewModelMapper'
import { PreferencesViewModelMapper } from 'infrastructure/http/mappers/PreferencesViewModelMapper'
import { AuthServiceContext } from 'infrastructure/context/AuthServiceContext'
import { EntityServiceContext } from 'infrastructure/context/EntityServiceContext'
import { StorageServiceContext } from 'infrastructure/context/StorageServiceContext'
import { UtilityServiceContext } from 'infrastructure/context/UtilityServiceContext'
import Theme from 'ui/shared/ui/Theme'
import LoadingIndicator from 'ui/shared/ui/LoadingIndicator'
import SuccessDisplay from 'ui/shared/ui/SuccessDisplay'
import { TagViewModelMapper } from 'infrastructure/http/mappers/TagViewModelMapper'
import { PostViewModelMapper } from 'infrastructure/http/mappers/PostViewModelMapper'

// lazy page imports
const FrontPage = React.lazy(() => import('ui/pages/FrontPage'))
const AccountPage = React.lazy(() => import('ui/pages/AccountPage'))
const ProfilePage = React.lazy(() => import('ui/pages/ProfilePage'))
const AllStoriesPage = React.lazy(() => import('ui/pages/AllStoriesPage'))
const MyStoriesPage = React.lazy(() => import('ui/pages/MyStoriesPage'))
const StoryPage = React.lazy(() => import('ui/pages/StoryPage'))
const CreateStoryPage = React.lazy(() => import('ui/pages/CreateStoryPage'))

const httpClientFactory = new HttpClientFactory(new HttpClient())

const authService = new AuthService(httpClientFactory.createAuthHttpClient(), new UserViewModelMapper())
const localStorageStoryService = new LocalStorageService<StoryViewModelDTO>(localStorage)
const localStorageAuthService = new LocalStorageService<AuthStateDTO>(localStorage)
const localStorageBreadcrumbService = new LocalStorageService<Breadcrumb[]>(localStorage)

export const utilityServiceContext: IUtilityServiceContext = {
  imageProcessingService: new ImageProcessingService()
}

const serviceFactory = new DataServiceFactory(
  httpClientFactory,
  new UserViewModelMapper(),
  new StoryViewModelMapper(new ImageViewModelMapper()),
  new ImageViewModelMapper(),
  new ProfileViewModelMapper(),
  new PreferencesViewModelMapper(),
  localStorageStoryService,
  new TagViewModelMapper(),
  new PostViewModelMapper(new ImageViewModelMapper())
)

export const authServiceContext: IAuthServiceContext = {
  authService: authService
}

export const storageServiceContext: IStorageServiceContext = {
  localStorageStoryService: localStorageStoryService,
  localStorageAuthService: localStorageAuthService,
  localStorageBreadcrumbService: localStorageBreadcrumbService
}

export const entityServiceContext: IEntityServiceContext = {
  userService: serviceFactory.createUserService(),
  postService: serviceFactory.createPostService(),
  storyService: serviceFactory.createStoryService(),
  profileService: serviceFactory.createProfileService(),
  preferencesService: serviceFactory.createPreferencesService(),
  imageService: serviceFactory.createImageService(),
  tagService: serviceFactory.createTagService()
}

export const AppProviders: React.FC = ({ children }) => {
  const [authContext] = useState<IAuthServiceContext>(authServiceContext)
  const [entityContext] = useState<IEntityServiceContext>(entityServiceContext)
  const [storageContext] = useState<IStorageServiceContext>(storageServiceContext)
  const [utilityContext] = useState<IUtilityServiceContext>(utilityServiceContext)

  return (
    <AuthServiceContext.Provider value={authContext}>
      <EntityServiceContext.Provider value={entityContext}>
        <StorageServiceContext.Provider value={storageContext}>
          <UtilityServiceContext.Provider value={utilityContext}>{children}</UtilityServiceContext.Provider>
        </StorageServiceContext.Provider>
      </EntityServiceContext.Provider>
    </AuthServiceContext.Provider>
  )
}

const App: React.FC = () => {
  const Main = () => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))

    return (
      <AppProviders>
        <Theme>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100dvh',
              height: '100%',
              backgroundColor: (theme) => theme.palette.background.paper
            }}
          >
            <React.Suspense fallback={<LoadingIndicator />}>
              <NavBar />
            </React.Suspense>
            <Box
              component="main"
              sx={{
                width: isSmall ? '100dvw' : '70dvw',
                margin: '0 auto',
                paddingBottom: '2em', // give space to ColorModeSwitch, TODO: remove when ColorMode is selected from user settings
                flex: '1 1 auto',
                display: 'flex',
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
        <Route
          index
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <FrontPage />
            </React.Suspense>
          }
        />
        <Route
          path="account"
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <AccountPage />
            </React.Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <ProfilePage />
            </React.Suspense>
          }
        />

        <Route
          path="stories"
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <AllStoriesPage />
            </React.Suspense>
          }
        />
        <Route
          path="mystories"
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <MyStoriesPage />
            </React.Suspense>
          }
        />
        <Route
          path="story"
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <StoryPage />
            </React.Suspense>
          }
        />
        <Route
          path="story/create"
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <CreateStoryPage />
            </React.Suspense>
          }
        />
        <Route
          path="story/:storyId"
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <StoryPage />
            </React.Suspense>
          }
        />

        {/* Using path="*"" means "match anything", so this route
            acts like a catch-all for URLs that we don't have explicit
            routes for. */}
        <Route
          path="*"
          element={
            <React.Suspense fallback={<LoadingIndicator />}>
              <FrontPage />
            </React.Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
