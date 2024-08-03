import React, { useState } from 'react'
import { Box, Popover, SxProps, Theme, Typography } from '@mui/material'

interface PopoverIconProps {
  children: React.ReactElement
  content: React.ReactNode
  sx?: SxProps<Theme>
}

export const PopoverIcon: React.FC<PopoverIconProps> = ({ children, content, sx }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const trigger = React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl((current) => (current ? null : event.currentTarget))
      children.props.onClick?.(event)
    },
    'aria-expanded': open,
    'aria-haspopup': 'true'
  })

  return (
    <>
      <Box component="span" sx={{ ...sx, display: 'inline-block' }}>
        {trigger}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        disableScrollLock
        slotProps={{
          paper: { sx: { maxWidth: '26em', p: 1.5 } }
        }}
      >
        <Typography variant="caption" component="div">
          {content}
        </Typography>
      </Popover>
    </>
  )
}
