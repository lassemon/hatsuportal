import { Box, Popover, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import {
  HexAlphaColorPicker,
  HexColorPicker,
  HslStringColorPicker,
  HslaStringColorPicker,
  RgbStringColorPicker,
  RgbaStringColorPicker
} from 'react-colorful'
import {
  ThemeColorPickerMode,
  colorHasAlpha,
  detectPickerMode,
  isNamedCssColor,
  toHexAlphaPickerValue,
  toHexPickerValue,
  toHslPickerValue,
  toRgbPickerValue
} from './themeColorPickerUtils'

interface ThemeColorPickerPopoverProps {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  value: string
  onChange: (value: string) => void
  label: string
}

const ThemeColorPickerPopover: React.FC<ThemeColorPickerPopoverProps> = ({ open, anchorEl, onClose, value, onChange, label }) => {
  const [pickerMode, setPickerMode] = useState<ThemeColorPickerMode>('hex')

  useEffect(() => {
    if (open) {
      setPickerMode(detectPickerMode(value))
    }
  }, [open, value])

  const hasAlpha = colorHasAlpha(value)
  const named = isNamedCssColor(value)

  const picker = (() => {
    if (pickerMode === 'hex') {
      if (hasAlpha) {
        return <HexAlphaColorPicker color={toHexAlphaPickerValue(value)} onChange={onChange} />
      }
      return <HexColorPicker color={toHexPickerValue(value)} onChange={onChange} />
    }

    if (pickerMode === 'rgb') {
      if (hasAlpha) {
        return <RgbaStringColorPicker color={toRgbPickerValue(value)} onChange={onChange} />
      }
      return <RgbStringColorPicker color={toRgbPickerValue(value)} onChange={onChange} />
    }

    if (hasAlpha) {
      return <HslaStringColorPicker color={toHslPickerValue(value)} onChange={onChange} />
    }
    return <HslStringColorPicker color={toHslPickerValue(value)} onChange={onChange} />
  })()

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Box
        sx={{
          p: 2,
          width: 260,
          '& .react-colorful': {
            width: '100%'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>

        {named && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Named color — edit the text field directly, or pick below to replace it with a hex/rgb/hsl value.
          </Typography>
        )}

        <Tabs value={pickerMode} onChange={(_, next: ThemeColorPickerMode) => setPickerMode(next)} sx={{ mb: 2, minHeight: 36 }}>
          <Tab value="hex" label="Hex" sx={{ minHeight: 36, py: 0 }} />
          <Tab value="rgb" label="RGB" sx={{ minHeight: 36, py: 0 }} />
          <Tab value="hsl" label="HSL" sx={{ minHeight: 36, py: 0 }} />
        </Tabs>

        {picker}
      </Box>
    </Popover>
  )
}

export default ThemeColorPickerPopover
