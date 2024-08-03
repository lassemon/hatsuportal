import { ToggleButton, ToggleButtonGroup, toggleButtonGroupClasses, ToggleButtonProps } from '@mui/material'
import { ColorSchemeEnum } from '@hatsuportal/common'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { styled } from '@mui/material/styles'
import { useSize } from 'ui/shared/hooks/useSize'

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  gap: theme.spacing(1),
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    border: 0,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0
    }
  }
}))

const StyledToggleButton = styled((props: ToggleButtonProps) => <ToggleButton {...props} />)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  textTransform: 'none',
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 100%',
  gap: theme.spacing(1),
  '&.Mui-selected': {
    background: theme.palette.info.main,
    color: theme.palette.getContrastText(theme.palette.info.main)
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main)
  }
}))

interface ColorSchemeSwitchProps {
  value: `${ColorSchemeEnum}`
  onChange: (mode: `${ColorSchemeEnum}`) => void
  onPreviewChange?: (mode: `${ColorSchemeEnum}`) => void
}

const ColorSchemeSwitch: React.FC<ColorSchemeSwitchProps> = ({ value, onChange, onPreviewChange }) => {
  const { isTiny } = useSize()

  const handleChange = (event: React.MouseEvent<HTMLElement>, newColorScheme: `${ColorSchemeEnum}` | null) => {
    if (!newColorScheme) return
    onChange(newColorScheme)
    onPreviewChange?.(newColorScheme)
  }

  return (
    <StyledToggleButtonGroup
      size="large"
      color="info"
      value={value}
      exclusive
      onChange={handleChange}
      sx={{ flexWrap: isTiny ? 'wrap' : 'nowrap' }}
    >
      <StyledToggleButton disabled={value === 'light'} value="light">
        Light
        <LightModeIcon />
      </StyledToggleButton>
      <StyledToggleButton disabled={value === 'dark'} value="dark">
        Dark
        <DarkModeIcon />
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  )
}

export default ColorSchemeSwitch
