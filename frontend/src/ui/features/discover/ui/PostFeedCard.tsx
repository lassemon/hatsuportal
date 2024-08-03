import { Box, Typography } from '@mui/material'
import React from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { ColorSchemeEnum } from '@hatsuportal/common'
import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { localStorageColorSchemeAtom } from 'ui/shared/state/displayPreferencesAtoms'
import { useSize } from 'ui/shared/hooks/useSize'

interface PostFeedCardProps {
  post: PostViewModel<PostViewModelDTO>
  onClick?: () => void
}

export const PostFeedCard: React.FC<PostFeedCardProps> = ({ post, onClick }) => {
  const [authState] = useAtom(authAtom)
  const colorScheme = useAtomValue(localStorageColorSchemeAtom)

  const { isTiny } = useSize()

  const imageUrl = post.coverImage?.base64
    ? post.coverImage.base64
    : colorScheme === ColorSchemeEnum.Light
      ? '/assets/no_image_placeholder.webp'
      : '/assets/no_image_placeholder_dark.webp'

  return (
    <Box
      onClick={onClick}
      sx={{
        height: '100%',
        width: 'auto',
        maxWidth: '100%',
        aspectRatio: isTiny ? '1/1' : '4/4',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: post.coverImage ? 'none' : 'saturate(0.5)'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1.5em',
          color: '#fff'
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 600, marginBottom: '0.25em' }}>
          {post.title}
        </Typography>
        {post.createdByName && (
          <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
            {post.getCreatedByName(authState.user?.id)}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default PostFeedCard
