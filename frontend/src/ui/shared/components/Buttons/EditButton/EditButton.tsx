import { SvgIconComponent } from '@mui/icons-material'
import { darken, IconButton, IconButtonProps } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
  editButton: {
    color: theme.palette.grey[50],
    '&:hover': {
      backgroundColor: darken(theme.palette.action.active, 0.1)
    }
  }
}))

interface EditButtonProps extends IconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  Icon?: SvgIconComponent
}

const EditButton: React.FC<EditButtonProps> = (props) => {
  const { onClick, size, Icon, ...passProps } = props
  const { classes } = useStyles()
  return Icon ? (
    <IconButton {...passProps} aria-label="save" className={classes.editButton} onClick={onClick}>
      <Icon fontSize={size ? size : 'large'} />
    </IconButton>
  ) : (
    <IconButton {...passProps} aria-label="save" className={classes.editButton} onClick={onClick}>
      <EditIcon fontSize={size ? size : 'large'} sx={{ filter: 'drop-shadow(0 0 0.1rem #000)' }} />
    </IconButton>
  )
}

export default EditButton
