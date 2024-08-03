import { Box } from '@mui/material'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useEffect, useRef, useState } from 'react'
import { ThemeList } from 'ui/blocks/ThemeList'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { usePreferenceSetters } from 'ui/entities/user/state/storePreferences'
import { useApplyThemePreference } from 'ui/entities/user/hooks/useApplyThemePreference'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { useSetAtom } from 'jotai'

export const DiscoverThemesPanel: React.FC = () => {
  const entityServiceContext = useEntityServiceContext()
  const controllersRef = useRef<AbortController[]>([])
  const [themes, setThemes] = useState<ThemeViewModel[]>([])
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  const [loadingThemes, setLoadingThemes] = useState(false)
  const setError = useSetAtom(errorAtom)

  const navigate = useNavigate()
  const setters = usePreferenceSetters()
  const { activeThemeId, applyingThemeId, onUseTheme } = useApplyThemePreference()

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoadingThemes(true)
        const controller = new AbortController()
        controllersRef.current.push(controller)
        const themes = await entityServiceContext.themeService.findAll({ signal: controller.signal })
        setThemes(themes)
      } catch (error: any) {
        if (!(error instanceof DOMException)) {
          setError(error)
        }
      } finally {
        setLoadingThemes(false)
      }
    }
    fetchThemes()

    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [entityServiceContext.themeService])

  useEffect(() => {
    return () => {
      setters.setColorSchemePreview(null)
      setters.setThemePreview(null)
    }
  }, [setters.setColorSchemePreview, setters.setThemePreview])

  useEffect(() => {
    if (activeThemeId) {
      setSelectedThemeId(activeThemeId)
    }
  }, [activeThemeId])

  const onSelectTheme = (theme: ThemeViewModel) => {
    setSelectedThemeId(theme.id)
    setters.setThemePreview(theme.displayColors)
  }

  const onEditTheme = (theme: ThemeViewModel) => {
    navigate(
      [
        { href: '/themes', label: 'Themes' },
        { href: `/theme/${theme.id}`, label: theme.name }
      ],
      { preventScrollReset: true }
    )
  }

  const handleUseTheme = async (theme: ThemeViewModel) => {
    if (!onUseTheme) return
    await onUseTheme(theme)
    setSelectedThemeId(null) // preview cleared by storePreferences; reset list selection
  }

  return (
    <Box sx={{ margin: '2em 0' }}>
      <ThemeList
        themes={themes}
        selectedThemeId={selectedThemeId}
        onSelectTheme={onSelectTheme}
        onEditTheme={onEditTheme}
        activeThemeId={activeThemeId}
        onUseTheme={handleUseTheme}
        applyingThemeId={applyingThemeId}
        loading={loadingThemes}
      />
    </Box>
  )
}
