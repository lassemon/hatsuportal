import { Avatar, Box, Divider, styled, Tab, Tabs, Typography } from '@mui/material'
import useDefaultPage from 'ui/shared/hooks/useDefaultPage'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import isEmpty from 'lodash/isEmpty'
import PageSection from 'ui/shared/ui/PageSection'
import UserCreationDates from 'ui/blocks/UserCreationDates'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { defaultAvatarMale } from 'ui/shared/util/defaultAvatarMale'
import MyStoriesPage from './MyStoriesPage'
import { ProfileViewModel } from 'ui/entities/user/model/ProfileViewModel'
import PreferencesPage from './PreferencesPage'
import Panel from 'ui/shared/ui/Panel/Panel'
import { useSize } from 'ui/shared/hooks/useSize'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      tabIndex={0}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const StyledTabPanel = styled(TabPanel)(({ theme }) => ({
  padding: theme.breakpoints.down('sm') ? 0 : theme.spacing(2)
}))

const ProfilePage: React.FC = () => {
  const entityServiceContext = useEntityServiceContext()
  const [authState, setAuthState] = useAtom(authAtom)
  const [user] = useState(authState.user)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profile, setProfile] = useState<ProfileViewModel | null>(null)
  useDefaultPage(!authState.loggedIn)
  const { isTiny } = useSize()

  const [tabValue, setTabValue] = useState(0)

  const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue as number)
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
          const profileViewModel = await entityServiceContext.profileService.getProfile()
          setProfile(profileViewModel)
        } catch (error) {
          console.error('Failed to fetch profile', error)
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
      <Box>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.6rem', padding: '0 0 0 0.5em', marginBottom: '1em', color: (theme) => theme.palette.info.main, opacity: 0.4 }}
        >
          id {`{ ${user.id} }`}
        </Typography>
        <Box
          sx={{
            color: (theme) => theme.palette.getContrastText(theme.palette.background.paper),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {!isTiny && <Box sx={{ width: '7em' }} />}
            <Box
              sx={{
                display: 'flex',
                width: '60%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Avatar
                src={`data:image/png;base64,${defaultAvatarMale}`}
                sx={{ width: '60%', maxWidth: 250, height: 'auto', maxHeight: 250 }}
              />
              {user.name}
              {!isEmpty(authState.user?.roles) && (
                <Typography variant="subtitle1" sx={{ opacity: 0.7, fontWeight: 'bold', fontSize: '0.6rem' }}>
                  {authState.user?.roles.map((role) => role).join(' | ')}
                </Typography>
              )}
              <Typography variant="body2" sx={{ margin: '0.5em 0 0 0', wordBreak: 'break-word' }}>
                {user.email}
              </Typography>
              {profile?.statusMessage && (
                <Typography variant="body2" sx={{ margin: '0.5em 0 0 0', fontStyle: 'italic' }}>
                  {profile.statusMessage}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: isTiny ? 'center' : 'flex-start',
          flexDirection: isTiny ? 'column' : 'row'
        }}
      >
        <Tabs
          orientation={isTiny ? 'horizontal' : 'vertical'}
          variant="scrollable"
          value={tabValue}
          onChange={onTabChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: isTiny ? 0 : 1, borderColor: 'divider' }}
        >
          <Tab label="Preferences" />
          <Tab label="Posts" />
          <Tab label="Bio" />
        </Tabs>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: isTiny ? '100%' : '60%' }}>
          <StyledTabPanel value={tabValue} index={0}>
            <PreferencesPage />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <MyStoriesPage />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={2}>
            {loadingProfile ? (
              <Typography variant="body2">Loading profile...</Typography>
            ) : (
              <Panel>
                <Typography variant="body1">{profile?.bio || 'No bio yet.'}</Typography>
              </Panel>
            )}
          </StyledTabPanel>
        </Box>
      </Box>

      <Divider sx={{ width: '100%', borderBottomWidth: 'medium' }} />

      <UserCreationDates user={authState.user} />
    </PageSection>
  )
}

export default ProfilePage
