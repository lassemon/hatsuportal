import React from 'react'
import { IconButton, IconButtonProps } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { makeStyles } from 'tss-react/mui'

import { SvgIconComponent } from '@mui/icons-material'

export const useStyles = makeStyles()((theme) => ({
  saveButton: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.secondary.main
  }
}))

interface SaveButtonProps extends IconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  Icon?: SvgIconComponent
}

const SaveButton: React.FC<SaveButtonProps> = (props) => {
  const { onClick, size, Icon, ...passProps } = props
  const { classes } = useStyles()
  return Icon ? (
    <IconButton {...passProps} aria-label="save" className={classes.saveButton} onClick={onClick}>
      <Icon fontSize={size ? size : 'large'} />
    </IconButton>
  ) : (
    <IconButton {...passProps} aria-label="save" className={classes.saveButton} onClick={onClick}>
      <SaveIcon fontSize={size ? size : 'large'} />
    </IconButton>
  )
}

export default SaveButton
