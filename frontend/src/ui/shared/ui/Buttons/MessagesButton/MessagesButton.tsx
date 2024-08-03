import { IconButton, IconButtonProps } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

const MessagesButton: React.FC<IconButtonProps> = (props) => {
  return (
    <IconButton {...props} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: '20%' }}>
      <SendIcon sx={{ transform: 'translate(1px, -3px) rotate(-35deg)', transformOrigin: 'center' }} />
    </IconButton>
  )
}

export default MessagesButton
