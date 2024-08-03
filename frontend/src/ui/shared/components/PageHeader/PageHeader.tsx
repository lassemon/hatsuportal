import React from 'react'
import { Typography, TypographyProps } from '@mui/material'

const PageHeader: React.FC<TypographyProps> = ({ children, sx, ...passProps }) => {
  return (
    <Typography
      variant="h4"
      sx={{
        ...{ display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 'bold' },
        ...sx
      }}
      color={(theme) => theme.palette.getContrastText(theme.palette.background.default)}
      {...passProps}
    >
      {children}
    </Typography>
  )
}

export default PageHeader
