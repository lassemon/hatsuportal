import { Box, Paper, ThemeProvider, Typography } from '@mui/material'
import { Control } from 'react-hook-form'
import { THEME_COLOR_FIELDS, ThemeColorFieldName } from '../model/themeEditForm'
import { FormInputs } from '../model/themeEditForm'
import ThemeColorInput from './ThemeColorInput'
import { useAppTheme } from 'ui/shared/hooks/useAppTheme'
import { ColorSchemeEnum } from '@hatsuportal/common'
import { useShownTheme } from 'ui/shared/hooks/useShownTheme'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import BlurOnIcon from '@mui/icons-material/BlurOn'
import { TextSaveButton } from 'ui/shared/ui/Buttons/SaveButton'
import { useSize } from 'ui/shared/hooks/useSize'

interface ThemeColorSchemePanelProps {
  mode: 'light' | 'dark'
  title: string
  selected: boolean
  onSelect: () => void
  control: Control<FormInputs>
  fieldErrors: Partial<Record<ThemeColorFieldName, string | null>>
  onUseScheme?: () => void
  schemeInUse?: boolean
  useSchemeLoading?: boolean
}

const ThemeColorSchemePanel: React.FC<ThemeColorSchemePanelProps> = ({
  mode,
  title,
  selected,
  onSelect,
  control,
  fieldErrors,
  onUseScheme,
  schemeInUse,
  useSchemeLoading
}) => {
  const prefix = mode === 'light' ? 'lightColors' : 'darkColors'

  const themePreview = useShownTheme()

  const lightTheme = useAppTheme(ColorSchemeEnum.Light, themePreview.lightColors)
  const darkTheme = useAppTheme(ColorSchemeEnum.Dark, themePreview.darkColors)

  const currentTheme = mode === 'light' ? lightTheme : darkTheme

  const { isTiny } = useSize()

  return (
    <ThemeProvider theme={currentTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
          flex: '0 1 calc(50% - 8px)',
          minWidth: isTiny ? '100%' : '24em'
        }}
      >
        <Paper
          sx={{
            p: 2,
            flex: 1,
            width: '100%',
            border: (theme) => (selected ? `4px solid ${theme.palette.primary.main}` : `4px solid transparent`),
            backgroundColor: (theme) => theme.palette.background.paper
          }}
        >
          <Box
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect()
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1em',
              padding: '1em',
              margin: '0 0 1em 0',
              flexWrap: isTiny ? 'wrap' : 'nowrap',
              justifyContent: isTiny ? 'center' : 'flex-start',
              backgroundColor: (theme) => theme.palette.background.default,
              color: (theme) => theme.palette.getContrastText(theme.palette.action.active),
              borderBottom: (theme) => `14px solid ${theme.palette.primary.main}`,
              ...(selected
                ? {
                    cursor: 'default'
                  }
                : {
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.primary.main,
                      borderBottom: (theme) => `14px solid ${theme.palette.action.active}`,
                      color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
                      '& .button-preview-1': {
                        backgroundColor: (theme) => theme.palette.background.paper
                      },
                      '& .title': {
                        color: (theme) => theme.palette.getContrastText(theme.palette.primary.main)
                      }
                    }
                  })
            }}
          >
            <Box
              className="title"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: '100%',
                color: (theme) => theme.palette.getContrastText(theme.palette.background.default)
              }}
            >
              <Typography variant="h5">{title}</Typography>
              <Typography variant="caption">Click to preview this color scheme</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 20%', gap: 1 }}>
              <Box
                className="button-preview-1"
                sx={{
                  display: 'flex',
                  height: '2em',
                  width: '100%',
                  borderRadius: '0.3em',
                  backgroundColor: (theme) => theme.palette.primary.main
                }}
              ></Box>
              <Box
                className="button-preview-2"
                sx={{
                  display: 'flex',
                  height: '2em',
                  width: '100%',
                  borderRadius: '0.3em',
                  backgroundColor: (theme) => theme.palette.action.active
                }}
              ></Box>
            </Box>
            <Box
              className="box-preview"
              sx={{
                display: 'flex',
                height: '4em',
                width: '8em',
                borderRadius: '0.3em',
                backgroundColor: (theme) => theme.palette.background.paper,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <BlurOnIcon sx={{ fontSize: '3em', color: (theme) => theme.palette.primary.main }} />
            </Box>
            <Box
              className="box-preview"
              sx={{
                display: 'flex',
                height: '4em',
                width: '8em',
                borderRadius: '0.3em',
                backgroundColor: (theme) => theme.palette.background.paper,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <BlurOnIcon sx={{ fontSize: '3em', color: (theme) => theme.palette.action.active }} />
            </Box>
          </Box>
          {THEME_COLOR_FIELDS.map(({ name, label, tooltip }) => (
            <ThemeColorInput
              key={`${prefix}.${name}`}
              name={`${prefix}.${name}`} // e.g. lightColors.primary
              label={label}
              tooltip={tooltip}
              control={control}
              error={fieldErrors[name] ?? null}
            />
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <TextSaveButton
              text={useSchemeLoading ? 'Applying…' : schemeInUse ? 'In use' : `Use ${mode} scheme`}
              hideIcon
              disabled={!onUseScheme || schemeInUse || useSchemeLoading}
              aria-label={schemeInUse ? `${title} is in use` : `Use ${title}`}
              onClick={(event) => {
                event.stopPropagation()
                onUseScheme?.()
              }}
              sx={{ minWidth: '6em' }}
            />
          </Box>
        </Paper>
        <Box sx={{ visibility: selected ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ArrowUpwardIcon sx={{ fontSize: '2em' }} />
          <Typography variant="caption">previewing</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default ThemeColorSchemePanel
