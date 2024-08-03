import { alpha, Button, ButtonProps, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

interface TextDeleteButtonProps extends ButtonProps {
  text?: string
  hideIcon?: boolean
}

const TextDeleteButton = ({
  onClick,
  variant = 'contained',
  disabled,
  sx,
  text = 'Delete',
  hideIcon = false,
  ...passProps
}: TextDeleteButtonProps) => {
  const deleteIcon = <DeleteIcon fontSize="large" sx={{ filter: 'drop-shadow(0 0 0.1rem #000)' }} />
  return (
    <Button
      onClick={onClick}
      startIcon={hideIcon ? undefined : deleteIcon}
      disabled={disabled}
      variant={variant ?? 'contained'}
      size="large"
      color="error"
      {...passProps}
      sx={{
        lineHeight: 'normal',
        color: (theme) => theme.palette.error.contrastText,
        padding: '0.25em 0.8em',
        border: `1px solid transparent`,
        '&:hover': {
          border: (theme) => `1px solid ${theme.palette.error.contrastText}`
        },
        '&:disabled': {
          backgroundColor: (theme) => alpha(theme.palette.error.main, 0.4),
          color: (theme) => alpha(theme.palette.error.contrastText, 0.3),
          pointerEvents: 'auto',
          cursor: 'default'
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

export default TextDeleteButton
