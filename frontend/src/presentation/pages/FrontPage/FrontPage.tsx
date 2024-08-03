import { Box, Typography, TypographyProps, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAtom } from 'application/state/atoms/authAtom'
import { useAtom } from 'jotai'
import { ImagePresentation } from '@hatsuportal/presentation'

// @ts-ignore
const FrontPageHeader: React.FC<TypographyProps> = ({ sx, ...props }) => {
  return (
    <Typography
      variant="h6"
      sx={{
        ...{
          textDecoration: 'underline',
          textUnderlineOffset: '0.45em',
          textDecorationThickness: '2px',
          borderBottom: (theme) => `3px solid ${theme.palette.primary.dark}`,
          width: '90%',
          whiteSpace: 'nowrap'
        },
        ...sx
      }}
      {...props}
    />
  )
}

const FrontPage: React.FC = () => {
  // @ts-ignore
  const [loadingImage, setLoadingImage] = useState(true)
  // @ts-ignore
  const [image, setImage] = useState<ImagePresentation | null | undefined>(null)
  const navigate = useNavigate()
  // @ts-ignore
  const [authState] = useAtom(authAtom)

  const theme = useTheme()
  // @ts-ignore
  const isLarge = useMediaQuery(theme.breakpoints.up('xl'))

  const imageRequestControllerRef = useRef<AbortController | null>(null)
  const pageStatsRequestControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // TODO make front page request
    return () => {
      pageStatsRequestControllerRef?.current?.abort()
      imageRequestControllerRef?.current?.abort()
    }
  }, [])

  // @ts-ignore
  const goToStory = (storyId?: string) => {
    if (storyId) {
      navigate(`/card/story/${storyId}`)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 100%',
        minHeight: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    ></Box>
  )
}

export default FrontPage
