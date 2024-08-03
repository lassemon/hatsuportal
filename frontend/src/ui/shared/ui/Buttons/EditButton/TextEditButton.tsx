import { alpha, Button, ButtonProps, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

interface TextEditButtonProps extends ButtonProps {
  text?: string
  hideIcon?: boolean
}

const TextEditButton = ({
  onClick,
  variant = 'contained',
  disabled,
  sx,
  text = 'Edit',
  hideIcon = false,
  ...passProps
}: TextEditButtonProps) => {
  const editIcon = <EditIcon fontSize="large" sx={{ filter: 'drop-shadow(0 0 0.1rem #000)' }} />
  return (
    <Button
      onClick={onClick}
      startIcon={hideIcon ? undefined : editIcon}
      disabled={disabled}
      variant={variant ?? 'contained'}
      size="large"
      color="info"
      {...passProps}
      sx={{
        lineHeight: 'normal',
        color: (theme) => theme.palette.info.contrastText,
        padding: '0.25em 0.8em',
        border: `1px solid transparent`,
        '&:hover': {
          border: (theme) => `1px solid ${theme.palette.info.contrastText}`
        },
        '&:disabled': {
          backgroundColor: (theme) => alpha(theme.palette.info.main, 0.4),
          color: (theme) => alpha(theme.palette.info.contrastText, 0.3),
          pointerEvents: 'auto',
          cursor: 'default'
        },
        '&:disabled:hover': {
          border: `1px solid transparent`
        },
        ...sx
      }}
    >
      <Typography variant="button" sx={{ lineHeight: 'normal' }}>
        {text}
      </Typography>
    </Button>
  )
}

export default TextEditButton
