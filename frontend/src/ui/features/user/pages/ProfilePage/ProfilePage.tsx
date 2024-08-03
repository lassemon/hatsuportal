import { Avatar, Box, Divider, Tab, Typography } from '@mui/material'
import useDefaultPage from 'ui/shared/hooks/useDefaultPage'
import { authAtom } from 'ui/state/authAtom'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import PageHeader from 'ui/shared/components/PageHeader'
import PageSection from 'ui/shared/components/PageSection'
import UserCreationDates from 'ui/features/user/components/UserCreationDates'
import { ProfileResponse } from '@hatsuportal/contracts'
import { useDataServiceContext } from 'infrastructure/hooks/useDataServiceContext'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { testAvatar } from './testAvatar'
import { TabPanel } from '@mui/lab'
import { TabContext, TabList } from '@mui/lab'

const ProfilePage: React.FC = () => {
  const dataServiceContext = useDataServiceContext()
  const [authState, setAuthState] = useAtom(authAtom)
  const [user] = useState(authState.user)
  // @ts-ignore
  const [loadingProfile, setLoadingProfile] = useState(false)
  // @ts-ignore
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const navigate = useNavigate()
  useDefaultPage(!authState.loggedIn)

  const [tabValue, setTabValue] = React.useState('1')

  const onTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    const fetchAndSetUser = async () => {
      if (authState.user)
        try {
          const fetchedUser = await dataServiceContext.userService.findCurrentUser()
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
          const profileResponse = await dataServiceContext.profileService.getProfile().finally(() => {
            setLoadingProfile(false)
          })
          setProfile(profileResponse)
        } catch (error) {
          console.error('Failed to fetch profile', error)
        }
      }
    }

    if (authState.loggedIn) {
      fetchAndSetUser()
      fetchAndSetProfile()
    }
  }, [])

  // @ts-ignore
  const goToMyStories = () => {
    navigate([{ href: '/mystories', label: 'My Stories' }])
  }

  if (!user) {
    return null
  }

  console.log(profile)

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
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.info.main, opacity: 0.4 }}>
          id {`{ ${user.id} }`}
        </Typography>
        <PageHeader
          sx={{
            color: (theme) => theme.palette.getContrastText(theme.palette.background.paper),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Avatar src={`data:image/png;base64,${testAvatar}`} sx={{ width: 250, height: 250 }} />
          {user.name}
          {!_.isEmpty(authState.user?.roles) && (
            <Typography variant="subtitle1" sx={{ opacity: 0.7, fontWeight: 'bold', fontSize: '0.6rem' }}>
              {authState.user?.roles.map((role) => role).join(' | ')}
            </Typography>
          )}
          <Typography variant="body2" sx={{ margin: '0.5em 0 0 0' }}>
            {user.email}
          </Typography>
        </PageHeader>
      </div>

      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={onTabChange} aria-label="lab API tabs example">
            <Tab label="Posts" value="1" />
            <Tab label="About" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">Amount of stories created: {profile?.storiesCreated}</TabPanel>
        <TabPanel value="2">::TBD::</TabPanel>
      </TabContext>

      <Divider sx={{ width: '100%', borderBottomWidth: 'medium' }} />

      <UserCreationDates user={authState.user} />
    </PageSection>
  )
}

export default ProfilePage
