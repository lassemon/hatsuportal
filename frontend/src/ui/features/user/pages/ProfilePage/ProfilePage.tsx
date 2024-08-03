import { Box, Divider, SnackbarContent, Stack, Typography } from '@mui/material'
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
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.info.main }}>
          id {`{ ${user.id} }`}
        </Typography>
        <PageHeader
          sx={{
            color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
          }}
        >
          {user.name}
          <Typography variant="body2" sx={{ textAlign: 'right', margin: '-8px -20px 0 0', textTransform: 'initial' }}>
            {user.email}
          </Typography>
        </PageHeader>
      </div>

      {!_.isEmpty(authState.user?.roles) && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', opacity: '0.7', color: (theme) => theme.palette.info.main }}>
            Roles
          </Typography>
          {authState.user?.roles.map((role, index) => (
            <Stack spacing={2} sx={{ maxWidth: 600, margin: '0.5em 0 0 2em' }} key={index}>
              <SnackbarContent
                message={role}
                elevation={0}
                variant="outlined"
                sx={{
                  background: (theme) => theme.palette.primary.main,
                  color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
                  textTransform: 'capitalize',
                  fontWeight: 'bold',
                  fontFamily: 'inherit'
                }}
              />
            </Stack>
          ))}
        </Box>
      )}

      <Divider sx={{ width: '100%', borderBottomWidth: 'medium' }} />

      <UserCreationDates user={authState.user} />
    </PageSection>
  )
}

export default ProfilePage
