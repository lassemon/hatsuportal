import { Box } from '@mui/material'
import React, { useState } from 'react'

import { IAuthServiceContext, IEntityServiceContext, IUtilityServiceContext } from 'application/interfaces'
import NavBar from 'ui/blocks/NavBar'
import { StoryViewModelDTO } from 'ui/entities/story/model/StoryViewModel'
import { AuthStateDTO } from 'ui/entities/user/state/authAtom'
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
import PreferencesBootstrap from 'ui/app/bootstrap/PreferencesBootstrap'
import { TagViewModelMapper } from 'infrastructure/http/mappers/TagViewModelMapper'
import { PostViewModelMapper } from 'infrastructure/http/mappers/PostViewModelMapper'
import { ThemeViewModelMapper } from 'infrastructure/http/mappers/ThemeViewModelMapper'
import AppRoutes from 'ui/app/routes/AppRoutes'
import { SessionExpiredNotifier } from 'infrastructure/services/auth/SessionExpiredNotifier'
import SessionExpiredBootstrap from 'ui/app/bootstrap/SessionExpiredBootstrap'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'
import { MainLayout } from 'ui/app/MainLayout'

const sessionExpiredNotifier = new SessionExpiredNotifier()
const httpClientFactory = new HttpClientFactory(new HttpClient(sessionExpiredNotifier))

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
  new PreferencesViewModelMapper(new ThemeViewModelMapper()),
  new ThemeViewModelMapper(),
  localStorageStoryService,
  new TagViewModelMapper(),
  new PostViewModelMapper(new ImageViewModelMapper())
)

export const authServiceContext: IAuthServiceContext = {
  authService: authService,
  sessionExpiredNotifier: sessionExpiredNotifier
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
  themeService: serviceFactory.createThemeService(),
  imageService: serviceFactory.createImageService(),
  tagService: serviceFactory.createTagService()
}

const AppProviders: React.FC = ({ children }) => {
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

const Bootsrappers: React.FC = ({ children }) => {
  return (
    <React.Fragment>
      <SessionExpiredBootstrap>
        <PreferencesBootstrap>{children}</PreferencesBootstrap>
      </SessionExpiredBootstrap>
    </React.Fragment>
  )
}

const App: React.FC = () => {
  const Main = () => {
    return (
      <AppProviders>
        <Bootsrappers>
          <Theme>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100dvh',
                backgroundColor: (theme) => theme.palette.background.paper
              }}
            >
              <React.Suspense fallback={<LoadingSkeleton skeletonProps={{ height: '4em' }} />}>
                <NavBar />
              </React.Suspense>
              <React.Suspense fallback={<LoadingSkeleton skeletonProps={{ height: '20em' }} />}>
                <MainLayout />
              </React.Suspense>
            </Box>
          </Theme>
        </Bootsrappers>
      </AppProviders>
    )
  }

  return <AppRoutes RootContainer={Main} />
}

export default App
