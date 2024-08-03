import { Button, ButtonProps } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'

interface TextSaveButtonProps extends ButtonProps {
  text?: string
  hideIcon?: boolean
}

const TextSaveButton = ({
  onClick,
  variant = 'contained',
  disabled,
  sx,
  text = 'Save',
  hideIcon = false,
  ...passProps
}: TextSaveButtonProps) => {
  const saveIcon = <SaveIcon fontSize="large" sx={{ filter: 'drop-shadow(0 0 0.1rem #000)' }} />
  return (
    <Button
      onClick={onClick}
      startIcon={hideIcon ? undefined : saveIcon}
      variant={variant ?? 'contained'}
      disabled={disabled}
      color="success"
      {...passProps}
      sx={{
        lineHeight: 'normal',
        border: `1px solid transparent`,
        '&:hover': {
          border: (theme) => `1px solid ${theme.palette.success.contrastText}`
        },
        '&:disabled': {
          pointerEvents: 'auto',
          cursor: 'default'
        },
        '&:disabled:hover': {
          border: `1px solid transparent`
        },
        ...sx
      }}
    >
      {text}
    </Button>
  )
}

export default TextSaveButton
