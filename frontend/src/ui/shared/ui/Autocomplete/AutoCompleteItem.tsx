import { Paper } from '@mui/material'
import { withStyles } from 'tss-react/mui'

export const AutoCompleteItem = withStyles(Paper, (theme) => {
  const autoCompleteColors = theme.palette.augmentColor({ color: { main: theme.palette.primary.dark } })
  return {
    root: {
      '& .MuiAutocomplete-listbox': {
        color: theme.palette.getContrastText(theme.palette.background.paper),
        "& .MuiAutocomplete-option[aria-selected='true']": {
          background: theme.palette.secondary.light,
          color: theme.palette.getContrastText(theme.palette.secondary.light),
          '&.Mui-focused': {
            background: theme.palette.secondary.main,
            color: theme.palette.getContrastText(theme.palette.secondary.main)
          }
        },
        '& .MuiAutocomplete-groupLabel': {
          background: autoCompleteColors.light,
          color: theme.palette.getContrastText(autoCompleteColors.light)
        }
      },
      '& .MuiAutocomplete-listbox .MuiAutocomplete-option.Mui-focused': {
        background: autoCompleteColors.light,
        color: theme.palette.getContrastText(autoCompleteColors.light)
      }
    }
  }
})
