import { Box, darken, lighten, Skeleton, Typography, useTheme } from '@mui/material'
import _ from 'lodash'
import React from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import { authAtom } from 'ui/state/authAtom'
import { localStorageColorModeAtom } from 'ui/state/localStorageColorModeAtom'
import { dateStringFromUnixTime, VisibilityEnum } from '@hatsuportal/common'

interface TinyStoryCardProps {
  story: StoryViewModel | null
  loading?: boolean
  onClick?: () => void
}

export const TinyStoryCard: React.FC<TinyStoryCardProps> = ({ story, loading = false, onClick }) => {
  const [authState] = useAtom(authAtom)
  const colorMode = useAtomValue(localStorageColorModeAtom)
  const theme = useTheme()

  if (!story) {
    return null
  }

  const image = story.coverImage
    ? React.createElement('img', {
        alt: 'Cover for the story',
        src: story.coverImage.base64,
        hash: story.coverImage.createdAt || story.coverImage.updatedAt
      })
    : null

  const imageUrl = image
    ? image.props.src
    : colorMode === 'light'
      ? '/assets/no_image_placeholder.webp'
      : '/assets/no_image_placeholder_dark.webp'

  const visibilityColor =
    story.visibility === VisibilityEnum.Public
      ? theme.palette.success.main
      : story.visibility === VisibilityEnum.LoggedIn
        ? theme.palette.warning.main
        : story.visibility === VisibilityEnum.Private
          ? theme.palette.error.main
          : theme.palette.common.black

  return (
    <Box
      sx={{
        height: '100%',
        background: (theme) => theme.palette.background.paper,
        '&:hover': {
          background: (theme) =>
            colorMode === 'light' ? darken(theme.palette.background.paper, 0.08) : lighten(theme.palette.background.paper, 0.08),
          cursor: 'pointer'
        }
      }}
      onClick={onClick}
    >
      {!loading ? (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            gap: '0.75em',
            position: 'relative',
            paddingBottom: '1.5em'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              width: '100%',
              height: '11em',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              aspectRatio: '1/1',
              borderRadius: '0.5em',
              filter: image ? 'none' : 'saturate(0.5)',
              borderBottom: authState.loggedIn ? `5px solid ${visibilityColor}` : 'none'
            }}
          ></Box>
          <Box sx={{ display: 'flex' }}>
            <Typography
              variant="body1"
              sx={{
                margin: '0',
                color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
              }}
            >
              {story.title}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              opacity: 0.5
            }}
          >
            {story.createdByName && (
              <Typography variant="body2" sx={{ fontSize: '0.6em' }}>
                <span style={{ fontWeight: '600', margin: '0.4em 0.4em 0 0', textTransform: 'capitalize' }}>
                  {story.getCreatedByName(authState.user?.id)}
                </span>
                {story.updatedAt && <span>{dateStringFromUnixTime(story.updatedAt)}</span>}
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: '1 0 60%' }}>
          <Skeleton variant="rounded" width="80%" height={60} animation="wave" sx={{ margin: '0 0 1em 0' }} />
        </Box>
      )}
    </Box>
  )
}

export default TinyStoryCard
