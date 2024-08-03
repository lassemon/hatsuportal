import { Chip as MuiChip, ChipProps, darken } from '@mui/material'

export const Chip = (props: ChipProps) => {
  return (
    <MuiChip
      sx={{
        backgroundColor: (theme) => darken(theme.palette.action.active, 0.1),
        color: (theme) => theme.palette.getContrastText(theme.palette.action.active),
        '& .MuiSvgIcon-root': {
          color: (theme) => theme.palette.getContrastText(theme.palette.action.active),
          opacity: 0.5
        },
        border: (theme) => `1px solid ${darken(theme.palette.action.active, 0.2)}`
      }}
      {...props}
    />
  )
}
