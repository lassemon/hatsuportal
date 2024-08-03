import { ColorSchemeEnum } from '@hatsuportal/common'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { applyColorScheme, usePreferenceSetters } from 'ui/entities/user/state/storePreferences'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { successAtom } from 'ui/shared/state/successAtom'

export function useApplyColorSchemePreference() {
  const entityServiceContext = useEntityServiceContext()
  const setters = usePreferenceSetters()
  const [preferences] = useAtom(userPreferencesAtom)
  const [errorState, setError] = useAtom(errorAtom)
  const setSuccess = useSetAtom(successAtom)
  const [applyingColorScheme, setApplyingColorScheme] = useState<`${ColorSchemeEnum}` | null>(null)
  const controllersRef = useRef<AbortController[]>([])

  const activeColorScheme = (preferences?.colorScheme as `${ColorSchemeEnum}` | undefined) ?? null

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  const applyScheme = async (colorScheme: `${ColorSchemeEnum}`) => {
    if (!preferences) return
    if (colorScheme === activeColorScheme) return
    if (errorState) setError(null)

    const controller = new AbortController()
    controllersRef.current.push(controller)
    setApplyingColorScheme(colorScheme)

    try {
      await applyColorScheme(colorScheme, entityServiceContext.preferencesService, setters, {
        signal: controller.signal
      })
      const label = colorScheme === ColorSchemeEnum.Light ? 'Light' : 'Dark'
      setSuccess({ message: `${label} color scheme saved to preferences.` })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setError(error instanceof Error ? error : new Error('Failed to apply color scheme'))
    } finally {
      setApplyingColorScheme(null)
    }
  }

  return {
    activeColorScheme,
    applyingColorScheme,
    onUseColorScheme: preferences ? applyScheme : undefined
  }
}
