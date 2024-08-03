import { Button, ButtonProps } from '@mui/material'
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
  removeImageButton: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.contrastText,
    borderRadius: '0',
    border: `1px solid ${theme.palette.grey[300]}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    }
  }
}))

interface RemoveImageButtonProps extends ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const RemoveImageButton: React.FC<RemoveImageButtonProps> = (props) => {
  const { onClick, children, ...passProps } = props
  const { classes } = useStyles()
  return (
    <Button
      {...passProps}
      endIcon={<CancelPresentationIcon />}
      aria-label="remove image"
      className={classes.removeImageButton}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export default RemoveImageButton
