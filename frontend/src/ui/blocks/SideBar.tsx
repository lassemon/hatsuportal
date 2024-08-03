import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { DiscoverOption, getDiscoverPath } from 'ui/features/discover/model/discoverOptions'
import { useSize } from 'ui/shared/hooks/useSize'

import MessagesButton from 'ui/shared/ui/Buttons/MessagesButton'
import ThemesButton from 'ui/shared/ui/Buttons/ThemesButton'

const SideBar: React.FC = () => {
  const navigate = useNavigate()
  const { isTiny } = useSize()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isTiny ? 'row' : 'column',
        gap: '1em',
        alignItems: 'center',
        justifyContent: 'center',
        //padding: isTiny ? '0.5em 0' : '0 0.5em',
        padding: isTiny ? 'calc(8px + env(safe-area-inset-bottom)) 0' : '0 0.5em',
        height: isTiny ? 'auto' : 'calc(100dvh - 65px)',
        width: isTiny ? '100%' : 'auto',
        position: isTiny ? 'fixed' : 'relative',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: 1000,
        backgroundColor: (theme) => theme.palette.background.paper
      }}
    >
      <MessagesButton onClick={() => navigate(getDiscoverPath(DiscoverOption.POSTS))} />
      <ThemesButton onClick={() => navigate(getDiscoverPath(DiscoverOption.THEMES))} />
    </Box>
  )
}

export default SideBar
