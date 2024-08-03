import { Box, darken, lighten, Skeleton, Typography } from '@mui/material'
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
}

export const TinyStoryCard: React.FC<TinyStoryCardProps> = ({ story, loading = false }) => {
  const [authState] = useAtom(authAtom)
  const colorMode = useAtomValue(localStorageColorModeAtom)

  if (!story) {
    return null
  }

  const image = story.coverImage
    ? React.createElement('img', {
        alt: story.coverImage.id, // TODO, should alt have a proper image name?
        src: story.coverImage.base64,
        hash: story.coverImage.createdAt || story.coverImage.updatedAt
      })
    : null

  return (
    <Box
      sx={{
        minWidth: '10em',
        height: '100%',
        borderRadius: '4px',
        background: (theme) => theme.palette.background.paper,
        borderBottom: (theme) =>
          `1px solid ${
            colorMode === 'light' ? darken(theme.palette.background.paper, 0.4) : lighten(theme.palette.background.paper, 0.15)
          }`,
        '&:hover': {
          background: (theme) =>
            colorMode === 'light' ? darken(theme.palette.background.paper, 0.08) : lighten(theme.palette.background.paper, 0.08),
          cursor: 'pointer'
        }
      }}
    >
      {!loading ? (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            padding: '0.5em'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
            <div>
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ flex: '1 0 60%' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      margin: '0',
                      color: (theme) => theme.palette.getContrastText(theme.palette.background.paper),
                      '&:after': {
                        display: 'block',
                        content: '" "',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        width: '100%',
                        height: '10px'
                      }
                    }}
                  >
                    {story.name}
                  </Typography>
                </Box>
              </Box>
            </div>
            {image && (
              <Box sx={{ width: '100%', flex: '1 1 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    width: '100%',
                    maxWidth: '120px',
                    minHeight: '120px',
                    maxHeight: '140px',
                    '&:before': {
                      content: '" "',
                      display: 'block',
                      position: 'absolute',
                      left: '0',
                      top: '0',
                      opacity: '0.6',
                      width: '100%',
                      height: '100%',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: '130%',
                      zIndex: '1'
                    }
                  }}
                >
                  <img alt={image.props.alt} src={`${image.props.src}`} />
                </Box>
              </Box>
            )}
            {!image && (
              <Box sx={{ flex: 'auto' }}>
                <Box sx={{ margin: '1em', height: '60px' }} />
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                {story.createdByName && (
                  <Typography variant="body2" sx={{ fontSize: '0.6em' }}>
                    Created by:{' '}
                    <span style={{ fontWeight: '600', margin: '0.4em 0 0 0' }}>{story.getCreatedByName(authState.user?.id)}</span>
                  </Typography>
                )}
                {story.updatedAt && (
                  <Typography variant="body2" sx={{ fontSize: '0.6em' }}>
                    <span>{dateStringFromUnixTime(story.updatedAt)}</span>
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                  {authState.loggedIn && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7em',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        lineHeight: 'normal',
                        color: (theme) =>
                          story.visibility === VisibilityEnum.Public
                            ? theme.palette.success.main
                            : story.visibility === VisibilityEnum.LoggedIn
                            ? theme.palette.warning.main
                            : story.visibility === VisibilityEnum.Private
                            ? theme.palette.error.main
                            : theme.palette.common.black
                      }}
                    >
                      {story.visibility_label}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
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
