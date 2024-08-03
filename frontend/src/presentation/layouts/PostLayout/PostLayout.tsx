import React from 'react'
import { Box } from '@mui/material'

interface PostLayoutProps {
  layoutComponent: React.ReactNode
  editComponent: React.ReactNode
  sx?: any
}

const PostLayout: React.FC<PostLayoutProps> = (props) => {
  const { layoutComponent, editComponent, sx = {} } = props

  return (
    <Box
      className="post-layout"
      sx={{
        ...sx,
        ...{
          margin: 0,
          padding: '1em',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          gap: '1em'
        }
      }}
    >
      <Box sx={{ flex: '3 1 60%' }}>{layoutComponent}</Box>
      {editComponent && (
        <Box
          displayPrint="none"
          sx={{
            '&&&': {
              padding: 0,
              paddingTop: 0,
              maxWidth: '100%',
              minHeight: '100%',
              maxHeight: 'inherit',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              flex: '2 1 40%'
            }
          }}
        >
          {editComponent}
        </Box>
      )}
    </Box>
  )
}

export default PostLayout
