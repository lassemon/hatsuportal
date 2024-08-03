import { SvgIconComponent } from '@mui/icons-material'
import { darken, IconButton, IconButtonProps } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
  closeButton: {
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: darken(theme.palette.action.active, 0.1)
    }
  }
}))

interface CloseButtonProps extends IconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  Icon?: SvgIconComponent
}

const CloseButton: React.FC<CloseButtonProps> = (props) => {
  const { onClick, size, Icon, ...passProps } = props
  const { classes } = useStyles()
  return Icon ? (
    <IconButton {...passProps} aria-label="save" className={classes.closeButton} onClick={onClick}>
      <Icon fontSize={size ? size : 'large'} />
    </IconButton>
  ) : (
    <IconButton {...passProps} aria-label="save" className={classes.closeButton} onClick={onClick}>
      <CloseIcon fontSize={size ? size : 'large'} sx={{ filter: 'drop-shadow(0 0 0.1rem #000)' }} />
    </IconButton>
  )
}

export default CloseButton
