import React from 'react'
import { IconButton, IconButtonProps } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import { SvgIconComponent } from '@mui/icons-material'

interface DeleteButtonProps extends IconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  Icon?: SvgIconComponent
}

const DeleteButton: React.FC<DeleteButtonProps> = (props) => {
  const { onClick, size, Icon, ...passProps } = props
  return Icon ? (
    <IconButton {...passProps} aria-label="delete" onClick={onClick}>
      <Icon fontSize={size ? size : 'large'} />
    </IconButton>
  ) : (
    <IconButton {...passProps} aria-label="delete" onClick={onClick}>
      <DeleteIcon fontSize={size ? size : 'large'} />
    </IconButton>
  )
}

export default DeleteButton
