import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DiscoverThemesPanel } from 'ui/features/discover/ui/DiscoverThemesPanel'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'

// lazy page imports
const FrontPage = React.lazy(() => import('ui/pages/FrontPage'))
const AccountPage = React.lazy(() => import('ui/pages/AccountPage'))
const ProfilePage = React.lazy(() => import('ui/pages/ProfilePage'))
const StoryPage = React.lazy(() => import('ui/pages/StoryPage'))
const CreateStoryPage = React.lazy(() => import('ui/pages/CreateStoryPage'))
const CreateThemePage = React.lazy(() => import('ui/pages/CreateThemePage'))
const EditThemePage = React.lazy(() => import('ui/pages/EditThemePage'))

const AppLoadingSkeleton = <LoadingSkeleton skeletonProps={{ height: '20em', sx: { margin: '3em' } }} />

interface AppRoutesProps {
  RootContainer: () => JSX.Element
}

const AppRoutes: React.FC<AppRoutesProps> = ({ RootContainer }) => {
  return (
    <Routes>
      <Route path="/" element={<RootContainer />}>
        <Route
          index
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <FrontPage />
            </React.Suspense>
          }
        />
        <Route
          path="account"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <AccountPage />
            </React.Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <ProfilePage />
            </React.Suspense>
          }
        />

        <Route path="stories" element={<Navigate to="/posts" replace />} />
        <Route
          path="story"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <StoryPage />
            </React.Suspense>
          }
        />
        <Route
          path="story/create"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <CreateStoryPage />
            </React.Suspense>
          }
        />
        <Route
          path="story/:storyId"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <StoryPage />
            </React.Suspense>
          }
        />
        <Route
          path="themes"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <DiscoverThemesPanel />
            </React.Suspense>
          }
        />
        <Route
          path="theme/create"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <CreateThemePage />
            </React.Suspense>
          }
        />
        <Route
          path="theme/:themeId"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <EditThemePage />
            </React.Suspense>
          }
        />

        {/* Using path="*"" means "match anything", so this route
            acts like a catch-all for URLs that we don't have explicit
            routes for. */}
        <Route
          path="*"
          element={
            <React.Suspense fallback={AppLoadingSkeleton}>
              <FrontPage />
            </React.Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default AppRoutes
