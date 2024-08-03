import { darken, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ColorMode, localStorageColorModeAtom } from 'ui/state/localStorageColorModeAtom'
import { useAtom } from 'jotai'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

const ColorModeSwitch: React.FC = () => {
  const [localStorageColorMode, setLocalStorageColorMode] = useAtom(localStorageColorModeAtom)

  const handleChange = (event: React.MouseEvent<HTMLElement>, newColorMode: `${ColorMode}` | null) => {
    if (newColorMode) setLocalStorageColorMode(newColorMode)
  }

  return (
    <ToggleButtonGroup
      size="small"
      color="info"
      value={localStorageColorMode}
      exclusive
      onChange={handleChange}
      sx={{ width: '100%', position: 'absolute', bottom: 0 }}
    >
      <ToggleButton
        disabled={localStorageColorMode === 'light'}
        value="light"
        sx={{
          flex: '1 1 100%',
          borderRadius: 0,
          '&.Mui-selected': {
            background: (theme) => theme.palette.info.main,
            color: (theme) => theme.palette.getContrastText(theme.palette.info.main),
            '&:hover': { backgroundColor: (theme) => darken(theme.palette.info.main, 0.2) }
          }
        }}
      >
        Light <LightModeIcon />
      </ToggleButton>
      <ToggleButton
        disabled={localStorageColorMode === 'dark'}
        value="dark"
        sx={{
          flex: '1 1 100%',
          borderRadius: 0,
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgba(0, 0, 0, 0.87)' },
          '&.Mui-selected': {
            background: (theme) => theme.palette.info.main,
            color: (theme) => theme.palette.getContrastText(theme.palette.info.main),
            '&:hover': { backgroundColor: (theme) => darken(theme.palette.info.main, 0.2) }
          }
        }}
      >
        Dark <DarkModeIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ColorModeSwitch
