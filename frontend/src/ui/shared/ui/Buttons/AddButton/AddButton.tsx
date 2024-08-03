import { SvgIconComponent } from '@mui/icons-material'
import { darken, IconButton, IconButtonProps } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
  addButton: {
    '&:hover': {
      backgroundColor: darken(theme.palette.action.active, 0.1)
    }
  }
}))

interface AddButtonProps extends IconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  Icon?: SvgIconComponent
}

const AddButton: React.FC<AddButtonProps> = (props) => {
  const { onClick, size, Icon, ...passProps } = props
  const { classes } = useStyles()
  return Icon ? (
    <IconButton {...passProps} aria-label="add" className={classes.addButton} onClick={onClick}>
      <Icon fontSize={size ? size : 'large'} />
    </IconButton>
  ) : (
    <IconButton {...passProps} aria-label="add" className={classes.addButton} onClick={onClick}>
      <AddIcon fontSize={size ? size : 'large'} />
    </IconButton>
  )
}

export default AddButton
