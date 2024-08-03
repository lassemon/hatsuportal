import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { Warning, Image as ImageIcon, Help } from '@mui/icons-material'
import { ImageStateEnum } from '@hatsuportal/common'

interface ResilientImageProps {
  imageLoadState: ImageStateEnum
  imageUrl?: string
  alt: string
  className?: string
  fallbackComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  onImageLoad?: () => void
  onImageError?: () => void
  sx?: any
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  imageLoadState,
  imageUrl,
  alt,
  className = '',
  fallbackComponent,
  errorComponent,
  onImageLoad,
  onImageError,
  sx = {}
}) => {
  const [imageError, setImageError] = React.useState(false)

  React.useEffect(() => {
    // Reset error state when image load state changes
    if (imageLoadState === ImageStateEnum.Available) {
      setImageError(false)
    }
  }, [imageLoadState])

  const handleImageError = () => {
    setImageError(true)
    onImageError?.()
  }

  const handleImageLoad = () => {
    setImageError(false)
    onImageLoad?.()
  }

  const baseSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderRadius: 1,
    overflow: 'hidden',
    ...sx
  }

  const placeholderSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 3,
    color: 'text.secondary'
  }

  // If image load failed at the domain level
  if (imageLoadState === ImageStateEnum.FailedToLoad) {
    return (
      <Paper
        className={className}
        sx={{
          ...baseSx,
          backgroundColor: 'error.light',
          borderColor: 'error.main'
        }}
      >
        {errorComponent || (
          <Box sx={placeholderSx}>
            <Warning sx={{ fontSize: 40, mb: 1, color: 'error.main' }} />
            <Typography variant="h6" sx={{ mb: 0.5, color: 'text.primary' }}>
              Image failed to load
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 200, lineHeight: 1.4 }}>
              This story should have an image but it couldn't be retrieved
            </Typography>
          </Box>
        )}
      </Paper>
    )
  }

  // If no image is set
  if (imageLoadState === ImageStateEnum.NotSet) {
    return (
      <Paper
        className={className}
        sx={{
          ...baseSx,
          backgroundColor: (theme) => theme.palette.background.default,
          borderColor: (theme) => theme.palette.background.paper
        }}
      >
        {fallbackComponent || (
          <Box sx={placeholderSx}>
            <ImageIcon sx={{ fontSize: 40, mb: 1, color: 'background.contrastText' }} />
            <Typography variant="h6" sx={{ color: 'background.contrastText' }}>
              No image
            </Typography>
          </Box>
        )}
      </Paper>
    )
  }

  // If image should be available but failed to load in the browser
  if (imageLoadState === ImageStateEnum.Available && imageError) {
    return (
      <Paper
        className={className}
        sx={{
          ...baseSx,
          backgroundColor: 'error.main',
          borderColor: 'error.light'
        }}
      >
        {errorComponent || (
          <Box sx={placeholderSx}>
            <Warning sx={{ fontSize: 40, mb: 1, color: 'error.dark' }} />
            <Typography variant="h6" sx={{ mb: 0.5, color: 'background.paper' }}>
              Image failed to load
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 200, lineHeight: 1.4, color: 'background.paper' }}>
              This story should have an image but it couldn't be displayed
            </Typography>
          </Box>
        )}
      </Paper>
    )
  }

  // If image is available and should be displayed
  if (imageLoadState === ImageStateEnum.Available && imageUrl) {
    return (
      <Box
        className={className}
        sx={{
          ...baseSx,
          backgroundColor: (theme) => theme.palette.primary.main,
          borderColor: (theme) => theme.palette.background.paper
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </Box>
    )
  }

  // Fallback for unexpected states
  return (
    <Paper
      className={className}
      sx={{
        ...baseSx,
        backgroundColor: 'grey.100',
        borderColor: 'grey.400'
      }}
    >
      {fallbackComponent || (
        <Box sx={placeholderSx}>
          <Help sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Unknown image state
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
