import React from 'react'
import { darken, IconButton, IconButtonProps } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import { SvgIconComponent } from '@mui/icons-material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
  deleteButton: {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: darken(theme.palette.error.main, 0.2),
      color: theme.palette.error.contrastText
    }
  }
}))

interface DeleteButtonProps extends IconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  Icon?: SvgIconComponent
}

const DeleteButton: React.FC<DeleteButtonProps> = (props) => {
  const { onClick, size, Icon, ...passProps } = props
  const { classes } = useStyles()
  return Icon ? (
    <IconButton {...passProps} aria-label="delete" className={classes.deleteButton} onClick={onClick}>
      <Icon fontSize={size ? size : 'large'} />
    </IconButton>
  ) : (
    <IconButton {...passProps} aria-label="delete" className={classes.deleteButton} onClick={onClick}>
      <DeleteIcon fontSize={size ? size : 'large'} />
    </IconButton>
  )
}

export default DeleteButton
