import { Button, ButtonProps } from '@mui/material'
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation'

interface RemoveImageButtonProps extends ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const RemoveImageButton: React.FC<RemoveImageButtonProps> = (props) => {
  const { onClick, children, ...passProps } = props
  return (
    <Button
      color="primary"
      variant="contained"
      size="small"
      {...passProps}
      endIcon={<CancelPresentationIcon />}
      aria-label="remove image"
      onClick={onClick}
      sx={{
        borderRadius: '0',
        ...props.sx
      }}
    >
      {children}
    </Button>
  )
}

export default RemoveImageButton
