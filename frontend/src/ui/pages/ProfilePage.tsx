import { Avatar, Box, Divider, Tab, Typography } from '@mui/material'
import useDefaultPage from 'ui/shared/hooks/useDefaultPage'
import { authAtom } from 'ui/app/state/authAtom'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import isEmpty from 'lodash/isEmpty'
import PageHeader from 'ui/shared/ui/PageHeader'
import PageSection from 'ui/shared/ui/PageSection'
import UserCreationDates from 'ui/blocks/UserCreationDates'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { defaultAvatarMale } from 'ui/shared/lib/defaultAvatarMale'
import { TabPanel } from '@mui/lab'
import { TabContext, TabList } from '@mui/lab'
import MyStoriesPage from './MyStoriesPage'
import { ProfileViewModel } from 'ui/entities/user/model/ProfileViewModel'
import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'

const ProfilePage: React.FC = () => {
  const entityServiceContext = useEntityServiceContext()
  const [authState, setAuthState] = useAtom(authAtom)
  const [user] = useState(authState.user)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profile, setProfile] = useState<ProfileViewModel | null>(null)
  const [preferences, setPreferences] = useState<PreferencesViewModel | null>(null)
  useDefaultPage(!authState.loggedIn)

  const [tabValue, setTabValue] = React.useState('1')

  const onTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    const fetchAndSetUser = async () => {
      if (authState.user)
        try {
          const fetchedUser = await entityServiceContext.userService.findCurrentUser()
          setAuthState((_authState) => {
            return {
              ..._authState,
              user: fetchedUser
            }
          })
        } catch (error) {
          console.error('Failed to fetch user:', error)
        }
    }

    const fetchAndSetProfile = async () => {
      if (authState.user) {
        try {
          setLoadingProfile(true)
          const [profileViewModel, preferencesViewModel] = await Promise.all([
            entityServiceContext.profileService.getProfile(),
            entityServiceContext.preferencesService.getPreferences()
          ])
          setProfile(profileViewModel)
          setPreferences(preferencesViewModel)
        } catch (error) {
          console.error('Failed to fetch profile or preferences', error)
        } finally {
          setLoadingProfile(false)
        }
      }
    }

    if (authState.loggedIn) {
      fetchAndSetUser()
      fetchAndSetProfile()
    }
  }, [])

  if (!user) {
    return null
  }

  return (
    <PageSection
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignStories: 'flex-start',
        gap: '1.5em'
      }}
    >
      <div>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.6rem', marginBottom: '1em', color: (theme) => theme.palette.info.main, opacity: 0.4 }}
        >
          id {`{ ${user.id} }`}
        </Typography>
        <PageHeader
          component="div"
          sx={{
            color: (theme) => theme.palette.getContrastText(theme.palette.background.paper),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Avatar src={`data:image/png;base64,${defaultAvatarMale}`} sx={{ width: 250, height: 250 }} />
          {user.name}
          {!isEmpty(authState.user?.roles) && (
            <Typography variant="subtitle1" sx={{ opacity: 0.7, fontWeight: 'bold', fontSize: '0.6rem' }}>
              {authState.user?.roles.map((role) => role).join(' | ')}
            </Typography>
          )}
          <Typography variant="body2" sx={{ margin: '0.5em 0 0 0' }}>
            {user.email}
          </Typography>
          {profile?.statusMessage && (
            <Typography variant="body2" sx={{ margin: '0.5em 0 0 0', fontStyle: 'italic' }}>
              {profile.statusMessage}
            </Typography>
          )}
        </PageHeader>
      </div>

      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={onTabChange} aria-label="lab API tabs example">
            <Tab label="Settings" value="1" />
            <Tab label="Posts" value="2" />
            <Tab label="Bio" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">{/* <SettingsPage /> */}</TabPanel>
        <TabPanel value="2">
          <MyStoriesPage />
        </TabPanel>
        <TabPanel value="3">
          {loadingProfile ? (
            <Typography variant="body2">Loading profile...</Typography>
          ) : (
            <>
              <Typography variant="body1">{profile?.bio || 'No bio yet.'}</Typography>
              {preferences && (
                <Typography variant="body2" sx={{ marginTop: '1em', opacity: 0.8 }}>
                  Color scheme: {preferences.colorScheme}
                </Typography>
              )}
            </>
          )}
        </TabPanel>
      </TabContext>

      <Divider sx={{ width: '100%', borderBottomWidth: 'medium' }} />

      <UserCreationDates user={authState.user} />
    </PageSection>
  )
}

export default ProfilePage
