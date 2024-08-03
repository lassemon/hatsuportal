import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import { Box, darken, lighten, Typography } from '@mui/material'
import { useAtom } from 'jotai'
import { localStorageColorModeAtom } from 'ui/state/localStorageColorModeAtom'
import React from 'react'
import { Chip } from 'ui/shared/components/Chip'

interface StoryCardProps {
  story: StoryViewModel | null
  loadingStory?: boolean
  savingStory?: boolean
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, loadingStory = false, savingStory = false }) => {
  if (!story) return null

  const [colorMode] = useAtom(localStorageColorModeAtom)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: '1em',
        minHeight: '10em',
        height: '100%',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          height: '40%',
          width: '100%',
          zIndex: 0,
          display: 'flex',
          alignItems: 'flex-end',
          borderRadius: '1em 1em 0 0',
          position: 'relative',
          background: (theme) =>
            `linear-gradient(110deg, ${theme.palette.action.active} 50%, ${darken(theme.palette.action.active, 0.1)}  50%, ${darken(
              theme.palette.action.active,
              0.1
            )} 52%, ${lighten(theme.palette.action.active, 0.8)} 52%, ${lighten(theme.palette.action.active, 0.8)} 0)`,
          ...(story.coverImage?.base64 && { backgroundImage: `url(${story.coverImage.base64})` }),
          backgroundSize: 'cover',
          backgroundPosition: 'center 10%'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1.5em' }}>
          <Typography
            variant="h4"
            paragraph={false}
            sx={{
              color: (theme) => theme.palette.grey[50],
              padding: '0 0 0.2em 0.5em',
              textShadow: (theme) => `1px 1px 1px ${theme.palette.grey[800]}`
            }}
          >
            {story.name}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5em', alignItems: 'center' }}>
            {story.tags.map((tag) => (
              <Chip size="small" key={tag.id} label={tag.name} />
            ))}
          </Box>
        </Box>
      </Box>
      {!story.name && !story.description ? (
        <Typography
          variant="h4"
          color={(theme) => theme.palette.grey[colorMode === 'dark' ? 800 : 400]}
          paragraph={false}
          sx={{ flex: 1, alignSelf: 'center', textAlign: 'center', zIndex: 1 }}
        >
          Empty Story
        </Typography>
      ) : (
        <Box sx={{ flex: '1 1 60%', zIndex: 1, padding: '0.5em 0.5em 0 1em' }}>
          <Typography variant="body1" paragraph={false}>
            {story.description}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
