import { Box } from '@mui/material'
import React, { useState } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

import { IAuthServiceContext, IDataServiceContext, IUtilityServiceContext } from 'application/interfaces'
//import EditStoryLayout from 'presentation/layouts/EditStoryLayout'
//import CreateStoryLayout from 'presentation/layouts/CreateStoryLayout'
import ErrorDisplay from 'ui/features/frontPage/components/ErrorDisplay'
import ErrorFallback from 'ui/features/frontPage/components/ErrorFallback'
import FrontPage from 'ui/features/frontPage/pages/FrontPage'
import NavBar from 'ui/features/frontPage/components/NavBar'
import AccountPage from 'ui/features/user/pages/AccountPage'
import ProfilePage from 'ui/features/user/pages/ProfilePage'
import AllStoriesPage from 'ui/features/post/story/pages/AllStoriesPage'
import MyStoriesPage from 'ui/features/post/story/pages/MyStoriesPage'
import StoryPage from 'ui/features/post/story/pages/StoryPage'
import { StoryViewModelDTO } from 'ui/features/post/story/viewModels/StoryViewModel'
import { AuthStateDTO } from 'ui/state/authAtom'
import { IStorageServiceContext } from 'application/interfaces/context/IStorageServiceContext'
import { Breadcrumb } from 'ui/state/breadcrumbAtom'
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
import { AuthServiceContext } from 'infrastructure/context/AuthServiceContext'
import { DataServiceContext } from 'infrastructure/context/DataServiceContext'
import { StorageServiceContext } from 'infrastructure/context/StorageServiceContext'
import { UtilityServiceContext } from 'infrastructure/context/UtilityServiceContext'
import useOrientation from 'ui/shared/hooks/useOrientation'
import Theme from 'ui/shared/components/Theme'
import LoadingIndicator from 'ui/shared/components/LoadingIndicator'
import SuccessDisplay from 'ui/shared/components/SuccessDisplay'
import { TagViewModelMapper } from 'infrastructure/http/mappers/TagViewModelMapper'
import CreateStoryLayout from 'ui/features/post/story/layouts/CreateStoryLayout'

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
  localStorageStoryService,
  new TagViewModelMapper()
)

export const authServiceContext: IAuthServiceContext = {
  authService: authService
}

export const storageServiceContext: IStorageServiceContext = {
  localStorageStoryService: localStorageStoryService,
  localStorageAuthService: localStorageAuthService,
  localStorageBreadcrumbService: localStorageBreadcrumbService
}

// TODO, rename to FeatureServiceContext or EntityServiceContext ?
export const dataServiceContext: IDataServiceContext = {
  userService: serviceFactory.createUserService(),
  storyService: serviceFactory.createStoryService(),
  profileService: serviceFactory.createProfileService(),
  imageService: serviceFactory.createImageService(),
  tagService: serviceFactory.createTagService()
}

export const AppProviders: React.FC = ({ children }) => {
  const [authContext] = useState<IAuthServiceContext>(authServiceContext)
  const [dataContext] = useState<IDataServiceContext>(dataServiceContext)
  const [storageContext] = useState<IStorageServiceContext>(storageServiceContext)
  const [utilityContext] = useState<IUtilityServiceContext>(utilityServiceContext)

  return (
    <AuthServiceContext.Provider value={authContext}>
      <DataServiceContext.Provider value={dataContext}>
        <StorageServiceContext.Provider value={storageContext}>
          <UtilityServiceContext.Provider value={utilityContext}>{children}</UtilityServiceContext.Provider>
        </StorageServiceContext.Provider>
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
        <Route path="story/create" element={<CreateStoryLayout />} />
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
