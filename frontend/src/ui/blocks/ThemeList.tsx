import React from 'react'
import { useAtomValue } from 'jotai'
import ThemeCard from 'ui/entities/theme/ui/ThemeCard'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { Grid } from '@mui/material'
import { canUserEditTheme } from 'ui/features/edit-theme/model/themeEditForm'
import { useSize } from 'ui/shared/hooks/useSize'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'

interface ThemeListProps {
  themes: ThemeViewModel[]
  selectedThemeId: string | null
  onSelectTheme: (theme: ThemeViewModel) => void
  onEditTheme: (theme: ThemeViewModel) => void
  loading: boolean
  previewEnabled?: boolean
  activeThemeId?: string | null
  onUseTheme?: (theme: ThemeViewModel) => void
  applyingThemeId?: string | null
  editingThemeId?: string | null
  highlightedThemeId?: string | null
  treatHighlightAsSelected?: boolean
}

export const ThemeList: React.FC<ThemeListProps> = ({
  themes,
  selectedThemeId,
  onSelectTheme,
  onEditTheme,
  loading,
  previewEnabled = true,
  activeThemeId,
  onUseTheme,
  applyingThemeId,
  editingThemeId,
  highlightedThemeId,
  treatHighlightAsSelected
}) => {
  const resolvedHighlightId = highlightedThemeId ?? selectedThemeId
  const authState = useAtomValue(authAtom)

  const { isTiny } = useSize()

  return (
    <Grid
      container
      gap={4}
      sx={{
        justifyContent: isTiny ? 'center' : 'flex-start',
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 100%)',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(auto-fill, minmax(18em, 1fr))'
        }
      }}
    >
      {loading
        ? Array.from(Array(6).keys()).map((index) => {
            return (
              <LoadingSkeleton
                key={index}
                skeletonProps={{
                  height: '24em',
                  sx: { margin: '0 0 0.5em 0', backgroundColor: 'rgba(0, 0, 0, 0.21)', opacity: 1.0 - index * 0.15 }
                }}
              />
            )
          })
        : themes.map((theme) => {
            const isInteractionSelected =
              theme.id === selectedThemeId || (treatHighlightAsSelected === true && theme.id === resolvedHighlightId)
            return (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={isInteractionSelected}
                highlighted={theme.id === resolvedHighlightId}
                onSelect={() => onSelectTheme(theme)}
                onEdit={canUserEditTheme(authState.user, theme) ? () => onEditTheme(theme) : undefined}
                onUse={onUseTheme ? () => onUseTheme(theme) : undefined}
                inUse={theme.id === activeThemeId}
                useLoading={theme.id === applyingThemeId}
                editing={theme.id === editingThemeId}
                previewEnabled={previewEnabled}
              />
            )
          })}
    </Grid>
  )
}
