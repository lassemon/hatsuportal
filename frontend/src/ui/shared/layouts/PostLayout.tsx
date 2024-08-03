import React from 'react'
import { Box } from '@mui/material'
import { ViewModeEnum } from 'application/enums/ViewModeEnum'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'

interface PostLayoutProps {
  layoutComponent: React.ReactNode
  editComponent: React.ReactNode
  viewMode: ViewModeEnum
  sx?: any
}

const PostLayout: React.FC<PostLayoutProps> = (props) => {
  const [authState] = useAtom(authAtom)
  const { layoutComponent, editComponent, viewMode, sx = {} } = props

  return (
    <Box
      className="post-layout"
      sx={{
        ...sx,
        ...{
          position: 'relative',
          margin: 0,
          padding: '1em',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          gap: '1em'
        }
      }}
    >
      {authState.loggedIn && (
        <Box
          sx={{
            zIndex: 1,
            position: 'absolute',
            padding: '0.5em',
            top: '0.5em',
            bottom: '0',
            right: '0.5em',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            alignContent: 'space-between'
          }}
        ></Box>
      )}
      {viewMode === ViewModeEnum.View ? (
        <Box sx={{ flex: '3 1 60%' }}>{layoutComponent}</Box>
      ) : (
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
