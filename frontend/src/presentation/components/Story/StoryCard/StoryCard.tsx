import { StoryPresentation } from '@hatsuportal/presentation'
import { Box, Typography } from '@mui/material'
import { useAtom } from 'jotai'
import { localStorageColorModeAtom } from '../../Theme/Theme'
import React from 'react'

interface StoryCardProps {
  story: StoryPresentation | null
  loadingStory?: boolean
  savingStory?: boolean
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, loadingStory = false, savingStory = false }) => {
  if (!story) return null

  const [colorMode] = useAtom(localStorageColorModeAtom)

  const storyImage = story.image
    ? React.createElement('img', {
        alt: story.image.fileName,
        src: story.image.base64,
        hash: story.image.createdAt || story.image.updatedAt
      })
    : null

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
          <Box sx={{ flex: '1 1 auto' }}>
            {storyImage && (
              <p>
                <img alt={storyImage.props.alt} src={`${storyImage.props.src}`} />
              </p>
            )}
          </Box>
        </>
      )}
    </Box>
  )
}
