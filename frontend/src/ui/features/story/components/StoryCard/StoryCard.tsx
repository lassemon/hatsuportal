import { StoryViewModel } from 'ui/features/story/viewModels/StoryViewModel'
import { Box, Typography } from '@mui/material'
import { useAtom } from 'jotai'
import { localStorageColorModeAtom } from 'ui/state/localStorageColorModeAtom'
import React from 'react'
import { ResilientImage } from 'ui/shared/components/ResilientImage'

interface StoryCardProps {
  story: StoryViewModel | null
  loadingStory?: boolean
  savingStory?: boolean
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, loadingStory = false, savingStory = false }) => {
  if (!story) return null

  const [colorMode] = useAtom(localStorageColorModeAtom)

  const getImageUrl = () => {
    if (story.image && story.hasImage()) {
      return story.image.base64
    }
    return undefined
  }

  const getImageAlt = () => {
    return `Image for story: ${story.name}`
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: (theme) => theme.palette.background.paper,
        padding: '1em',
        borderRadius: '1em',
        minHeight: '10em'
      }}
    >
      {!story.name && !story.description ? (
        <Typography
          variant="h4"
          color={(theme) => theme.palette.grey[colorMode === 'dark' ? 800 : 400]}
          paragraph={false}
          sx={{ flex: 1, alignSelf: 'center', textAlign: 'center' }}
        >
          Empty Story
        </Typography>
      ) : (
        <>
          <Box sx={{ flex: '1 1 60%' }}>
            <Typography variant="h4" paragraph={false}>
              {story.name}
            </Typography>

            <Typography variant="body2" paragraph={false}>
              {story.description}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 auto', ml: 2 }}>
            <ResilientImage
              imageLoadState={story.imageLoadState}
              imageUrl={getImageUrl()}
              alt={getImageAlt()}
              sx={{
                minHeight: '8em',
                width: '100%',
                maxWidth: '12em'
              }}
            />
          </Box>
        </>
      )}
    </Box>
  )
}
