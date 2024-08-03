import { CSS_COLOR_MAX_LENGTH } from '@hatsuportal/common'
import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import { useState } from 'react'
import { Controller, Control, FieldPath } from 'react-hook-form'
import { getCssColorError, isValidCssColor } from 'ui/shared/util/parseCssColor'
import { FormInputs } from '../model/themeEditForm'
import ThemeColorPickerPopover from './ThemeColorPickerPopover'
import { toSwatchBackground } from './themeColorPickerUtils'
import { PopoverIcon } from 'ui/shared/ui/PopoverIcon'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

interface ThemeColorInputProps {
  name: FieldPath<FormInputs>
  label: string
  control: Control<FormInputs>
  error: string | null
  tooltip?: string
}

const ThemeColorInput: React.FC<ThemeColorInputProps> = ({ name, label, control, error, tooltip }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const openPicker = (element: HTMLElement) => {
    setAnchorEl(element)
  }

  const closePicker = () => {
    setAnchorEl(null)
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        validate: (value) => getCssColorError(typeof value === 'string' ? value : '') ?? true
      }}
      render={({ field }) => {
        const raw = typeof field.value === 'string' ? field.value : ''
        const swatch = toSwatchBackground(raw)
        const swatchIsValid = !raw.trim() || isValidCssColor(raw)

        return (
          <>
            <TextField
              {...field}
              id={name}
              label={label}
              variant="outlined"
              size="small"
              error={!!error}
              helperText={error}
              inputProps={{ maxLength: CSS_COLOR_MAX_LENGTH }}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '100%', margin: '0 0 1em' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Open color picker for ${label}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        openPicker(e.currentTarget)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openPicker(e.currentTarget)
                        }
                      }}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        bgcolor: swatch,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        opacity: swatchIsValid ? 1 : 0.4
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: tooltip ? (
                  <InputAdornment position="end">
                    <PopoverIcon content={tooltip}>
                      <IconButton
                        size="small"
                        aria-label={`Help for ${label}`}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ backgroundColor: 'transparent', '&:hover': { backgroundColor: 'transparent' } }}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </PopoverIcon>
                  </InputAdornment>
                ) : undefined
              }}
            />

            <ThemeColorPickerPopover
              open={open}
              anchorEl={anchorEl}
              onClose={closePicker}
              value={raw}
              onChange={field.onChange}
              label={label}
            />
          </>
        )
      }}
    />
  )
}

export default ThemeColorInput
