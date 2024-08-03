import { Box } from '@mui/material'
import { useAtom } from 'jotai'
import React, { useEffect } from 'react'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { DiscoverOption, discoverOptions, getDiscoverOptionFromPath, getDiscoverPath } from 'ui/features/discover/model/discoverOptions'
import { DiscoverPostsPanel } from 'ui/features/discover/ui/DiscoverPostsPanel'
import { useLocation, useNavigate } from 'react-router-dom'

const FrontPage: React.FC = () => {
  const [authState] = useAtom(authAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const selectedDiscoverOption = getDiscoverOptionFromPath(location.pathname)

  // Redirect away from login-required tabs when logged out
  useEffect(() => {
    const optionConfig = discoverOptions.find((o) => o.value === selectedDiscoverOption)
    if (optionConfig?.loginRequired && !authState.loggedIn) {
      navigate(getDiscoverPath(DiscoverOption.POSTS), { replace: true })
    }
  }, [selectedDiscoverOption, authState.loggedIn, navigate])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto', minHeight: 0, margin: 0 }}>
      <DiscoverPostsPanel />
    </Box>
  )
}

export default FrontPage
