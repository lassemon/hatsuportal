import { Box, Popover, Typography } from '@mui/material'
import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful'
import { colorHasAlpha, isNamedCssColor, toHexAlphaPickerValue, toHexPickerValue } from './themeColorPickerUtils'

interface ThemeColorPickerPopoverProps {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  value: string
  onChange: (value: string) => void
  label: string
}

const ThemeColorPickerPopover: React.FC<ThemeColorPickerPopoverProps> = ({ open, anchorEl, onClose, value, onChange, label }) => {
  const hasAlpha = colorHasAlpha(value)
  const named = isNamedCssColor(value)
  const picker = hasAlpha ? (
    <HexAlphaColorPicker color={toHexAlphaPickerValue(value)} onChange={onChange} />
  ) : (
    <HexColorPicker color={toHexPickerValue(value)} onChange={onChange} />
  )
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
          '& .react-colorful': {
            width: '100%',
            minWidth: '20ch'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {named && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Named color — edit the text field directly, or pick below to replace it with a hex value.
          </Typography>
        )}
        {picker}
      </Box>
    </Popover>
  )
}

export default ThemeColorPickerPopover
