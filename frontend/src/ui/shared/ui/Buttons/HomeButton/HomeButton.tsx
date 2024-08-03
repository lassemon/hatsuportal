import { IconButton, IconButtonProps } from '@mui/material'
import WifiTetheringIcon from '@mui/icons-material/WifiTethering'

const HomeButton: React.FC<IconButtonProps> = (props) => {
  return (
    <IconButton {...props}>
      <WifiTetheringIcon />
    </IconButton>
  )
}

export default HomeButton
