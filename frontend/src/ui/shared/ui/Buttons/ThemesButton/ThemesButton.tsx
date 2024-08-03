import { IconButton, IconButtonProps } from '@mui/material'
import WallpaperIcon from '@mui/icons-material/Wallpaper'

const ThemesButton: React.FC<IconButtonProps> = (props) => {
  return (
    <IconButton {...props} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: '20%' }}>
      <WallpaperIcon />
    </IconButton>
  )
}

export default ThemesButton
