import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ColorMode, localStorageColorModeAtom } from 'components/Theme/Theme'
import { useAtom } from 'jotai'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

const ColorModeSwitch: React.FC = () => {
  const [localStorageColorMode, setLocalStorageColorMode] = useAtom(localStorageColorModeAtom)

  const handleChange = (event: React.MouseEvent<HTMLElement>, newColorMode: `${ColorMode}` | null) => {
    if (newColorMode) setLocalStorageColorMode(newColorMode)
  }

  return (
    <ToggleButtonGroup size="small" color="info" value={localStorageColorMode} exclusive onChange={handleChange}>
      <ToggleButton
        value="light"
        sx={{
          flex: '1 1 100%',
          borderRadius: 0,
          '&.Mui-selected': {
            background: (theme) => theme.palette.info.main,
            color: (theme) => theme.palette.getContrastText(theme.palette.info.main)
          }
        }}
      >
        Light <LightModeIcon />
      </ToggleButton>
      <ToggleButton value="dark" sx={{ flex: '1 1 100%', borderRadius: 0 }} color="info">
        Dark <DarkModeIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ColorModeSwitch
