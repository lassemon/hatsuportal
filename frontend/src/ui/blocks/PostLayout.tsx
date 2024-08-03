import React from 'react'
import { Box } from '@mui/material'
import { ViewModeEnum } from 'application/enums/ViewModeEnum'
import { useSize } from 'ui/shared/hooks/useSize'
import config from 'config'

interface PostLayoutProps {
  layoutComponent: React.ReactNode
  editComponent: React.ReactNode
  viewMode: ViewModeEnum
  sx?: any
}

const PostLayout: React.FC<PostLayoutProps> = (props) => {
  const { layoutComponent, editComponent, viewMode, sx = {} } = props

  const { isSmall } = useSize()

  return (
    <Box
      className="post-layout"
      sx={{
        ...sx,
        ...{
          position: 'relative',
          margin: 0,
          padding: isSmall ? '0em' : '1em',
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'row',
          gap: '1em',
          maxWidth: config.textColumnMaxWidth
        }
      }}
    >
      {viewMode === ViewModeEnum.View ? (
        <Box sx={{ flex: '3 1 60%' }}>{layoutComponent}</Box>
      ) : (
        <Box
          displayPrint="none"
          sx={{
            flex: '3 1 60%'
          }}
        >
          {editComponent}
        </Box>
      )}
    </Box>
  )
}

export default PostLayout
