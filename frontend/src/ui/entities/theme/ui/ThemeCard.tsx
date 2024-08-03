import React from 'react'
import { alpha, Box, Skeleton, Theme, Tooltip, Typography } from '@mui/material'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { TextEditButton } from 'ui/shared/ui/Buttons/EditButton'
import { ColorSchemeEnum } from '@hatsuportal/common'
import { useAppTheme } from 'ui/shared/hooks/useAppTheme'
import { usePreferenceSetters } from 'ui/entities/user/state/storePreferences'
import { TextSaveButton } from 'ui/shared/ui/Buttons/SaveButton'
import Panel from 'ui/shared/ui/Panel/Panel'
import { useSize } from 'ui/shared/hooks/useSize'

interface ThemeCardProps {
  theme: ThemeViewModel
  selected: boolean
  onSelect: () => void
  onEdit?: () => void
  onUse?: () => void
  inUse?: boolean
  useLoading?: boolean
  editing?: boolean
  previewEnabled?: boolean
  disableHoverStyle?: boolean
  highlighted?: boolean
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  selected,
  highlighted,
  onSelect,
  onEdit,
  onUse,
  inUse,
  useLoading,
  editing,
  previewEnabled = true,
  disableHoverStyle = false
}) => {
  const isHighlighted = highlighted ?? selected
  const canPreview = previewEnabled && !selected
  const lightTheme = useAppTheme(ColorSchemeEnum.Light, theme.lightColors)
  const darkTheme = useAppTheme(ColorSchemeEnum.Dark, theme.darkColors)
  const { isTiny } = useSize()

  const editDisabled = !onEdit || editing
  const editDisabledReason = editing ? 'You are already editing this theme' : !onEdit ? 'You can only edit themes you created' : undefined

  const setters = usePreferenceSetters()

  const onSelectColorSchemePreview = (mode: `${ColorSchemeEnum}`) => {
    setters.setColorSchemePreview(mode)
  }

  const showHoverStyles = canPreview && !disableHoverStyle
  const showSelectedBorder = isHighlighted && !disableHoverStyle

  return (
    <Panel
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2em',
        padding: '0.5em',
        aspectRatio: isTiny ? '1/1' : '16/9',
        color: (theme) => theme.palette.getContrastText(theme.palette.background.default),
        backgroundColor: (theme) => (selected ? alpha(theme.palette.background.default, 0.5) : theme.palette.background.default),
        borderBottom: (theme) => (showSelectedBorder ? `4px solid ${theme.palette.action.active}` : `4px solid transparent`),
        cursor: showHoverStyles ? 'pointer' : 'default',
        '&:hover': showHoverStyles
          ? {
              borderBottom: (theme) => `4px solid ${theme.palette.action.active}`
            }
          : undefined,
        '&:hover .name': showHoverStyles
          ? {
              textDecoration: 'underline',
              textDecorationThickness: '3px',
              textUnderlineOffset: '3px'
            }
          : undefined
      }}
      onClick={canPreview ? onSelect : undefined}
    >
      <Typography variant="h4" textAlign="center" className={'name'}>
        {theme.name}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.6em', flexWrap: isTiny ? 'wrap' : 'nowrap' }}>
        <ColorBox theme={lightTheme} onClick={previewEnabled ? () => onSelectColorSchemePreview(ColorSchemeEnum.Light) : undefined} />
        <ColorBox theme={darkTheme} onClick={previewEnabled ? () => onSelectColorSchemePreview(ColorSchemeEnum.Dark) : undefined} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          width: '100%',
          marginBottom: '0.5em',
          marginTop: 'auto'
        }}
      >
        {editDisabled && editDisabledReason ? (
          <Tooltip
            title={
              <Typography variant="caption" component="span" sx={{ display: 'inline-block' }}>
                {editDisabledReason}
              </Typography>
            }
            placement="top-start"
          >
            <Box
              component="span"
              sx={{
                flex: 1,
                display: 'inline-flex',
                width: '100%'
              }}
            >
              <TextEditButton
                aria-label={`Edit theme ${theme.name}`}
                disabled
                onClick={(event) => {
                  event.stopPropagation()
                }}
                sx={{
                  flex: 1,
                  width: '100%',
                  '&:disabled': {
                    pointerEvents: 'none'
                  }
                }}
              />
            </Box>
          </Tooltip>
        ) : (
          <TextEditButton
            aria-label={`Edit theme ${theme.name}`}
            disabled={editDisabled}
            onClick={(event) => {
              event.stopPropagation()
              onEdit?.()
            }}
            sx={{ flex: 1 }}
          />
        )}
        <TextSaveButton
          text={useLoading ? 'Applying…' : inUse ? 'In use' : 'Use'}
          hideIcon={true}
          disabled={!onUse || inUse || useLoading}
          aria-label={inUse ? `Theme ${theme.name} is in use` : `Use theme ${theme.name}`}
          onClick={(event) => {
            event.stopPropagation()
            onUse?.()
          }}
          sx={{ flex: 1 }}
        ></TextSaveButton>
      </Box>
    </Panel>
  )
}

const ColorBox: React.FC<{ theme: Theme; onClick?: () => void }> = ({ theme, onClick }) => {
  return (
    <Box
      sx={{
        borderRadius: '0.5em',
        display: 'flex',
        flex: '1 1 100%',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.paper,
        border: `4px solid transparent`,
        '&:hover': onClick ? { border: `4px solid ${theme.palette.action.active}` } : undefined,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 30%',
          gap: '0.5em',
          padding: '0.5em',
          alignItems: 'center',
          minHeight: 0
        }}
      >
        <Skeleton
          variant="circular"
          animation={false}
          width={12}
          height={12}
          sx={{
            backgroundColor: theme.palette.action.active
          }}
        />
        <Skeleton
          variant="text"
          width="100%"
          height={20}
          animation={false}
          sx={{
            backgroundColor: theme.palette.background.default
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 100%',
          padding: '0.5em',
          minHeight: 0
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0.5em 0.7em',
            height: '100%',
            backgroundColor: theme.palette.background.default
          }}
        >
          <Skeleton
            variant="text"
            width="50%"
            height="17%"
            animation={false}
            sx={{
              backgroundColor: theme.palette.text.primary
            }}
          />
          <Skeleton
            variant="text"
            width="80%"
            height="17%"
            animation={false}
            sx={{
              backgroundColor: theme.palette.text.primary
            }}
          />
          <Skeleton
            variant="text"
            width="30%"
            height="17%"
            animation={false}
            sx={{
              backgroundColor: theme.palette.text.primary
            }}
          />

          <Skeleton
            variant="text"
            width="45%"
            height="28%"
            animation={false}
            sx={{
              alignSelf: 'flex-end',
              marginTop: 'auto',
              backgroundColor: theme.palette.primary.main
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default ThemeCard
