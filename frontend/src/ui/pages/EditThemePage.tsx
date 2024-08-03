import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { UpdateThemeRequest } from '@hatsuportal/contracts'
import ThemeEdit from 'ui/features/edit-theme'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useRedirectToFrontPageIfNotLoggedIn } from 'ui/shared/hooks/useRedirect'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { successAtom } from 'ui/shared/state/successAtom'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { canUserEditTheme, DEFAULT_TEMPLATE_ID } from 'ui/features/edit-theme/model/themeEditForm'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'
import { fetchAndStorePreferences, usePreferenceSetters } from 'ui/entities/user/state/storePreferences'
import { authAtom } from 'ui/entities/user/state/authAtom'

const EditThemePage: React.FC = () => {
  useRedirectToFrontPageIfNotLoggedIn()

  const { themeId } = useParams<{ themeId: string }>()

  const entityServiceContext = useEntityServiceContext()
  const controllersRef = useRef<AbortController[]>([])
  const [backendTheme, setBackendTheme] = useState<ThemeViewModel | null>(null)
  const [workingTheme, setWorkingTheme] = useState<ThemeViewModel | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [templatesVersion, setTemplatesVersion] = useState(0)
  const [errorState, setError] = useAtom(errorAtom)
  const [preferences] = useAtom(userPreferencesAtom)
  const setSuccess = useSetAtom(successAtom)
  const authState = useAtomValue(authAtom)
  const setters = usePreferenceSetters()
  const navigate = useNavigate()

  const deletingRef = useRef(false)

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  const setWorkingThemeFromPicker = (theme: ThemeViewModel | null) => {
    if (!theme || theme.id === DEFAULT_TEMPLATE_ID) {
      navigate([{ href: '/theme/create', label: 'Themes' }], { preventScrollReset: true })
      return
    }

    if (!canUserEditTheme(authState.user, theme)) {
      navigate([{ href: '/theme/create', label: 'Themes' }], { replace: true, preventScrollReset: true })
      return
    }

    if (theme.id === themeId) {
      setWorkingTheme(theme)
      return
    }

    setBackendTheme(theme)
    setWorkingTheme(theme)
    navigate(
      [
        { href: '/theme/create', label: 'Themes' },
        { href: `/theme/${theme.id}`, label: theme.name }
      ],
      { preventScrollReset: true, replace: true }
    )
  }

  const onEditTheme = (theme: ThemeViewModel) => {
    setWorkingThemeFromPicker(theme)
  }

  useEffect(() => {
    if (backendTheme?.id === themeId && workingTheme?.id === themeId) {
      setLoading(false)
      return
    }

    if (!themeId) {
      setLoading(false)
      setError(new Error('Theme id is missing'))
      return
    }

    setBackendTheme(null)
    setWorkingTheme(null)
    setLoading(true)

    const controller = new AbortController()
    controllersRef.current.push(controller)
    setLoading(true)

    entityServiceContext.themeService
      .findAll({ signal: controller.signal })
      .then((themes) => {
        const found = themes.find((t) => t.id === themeId) ?? null

        if (!found) {
          setError(new Error('Theme not found'))
          return
        }

        if (!canUserEditTheme(authState.user, found)) {
          navigate([{ href: '/theme/create', label: 'Themes' }], { replace: true, preventScrollReset: true })
          return
        }

        setBackendTheme(found)
        setWorkingTheme(found)
      })
      .catch((error) => setError(error instanceof Error ? error : new Error('Failed to load theme')))
      .finally(() => setLoading(false))
  }, [themeId, entityServiceContext.themeService])

  const onUpdate = (id: string, request: UpdateThemeRequest) => {
    if (errorState) {
      setError(null)
    }

    const controller = new AbortController()
    controllersRef.current.push(controller)
    setSaving(true)

    entityServiceContext.themeService
      .update(id, request, { signal: controller.signal })
      .then(async (saved) => {
        if (preferences?.selectedTheme.id === saved.id) {
          await fetchAndStorePreferences(entityServiceContext.preferencesService, setters)
        }

        setSuccess({ message: `Theme "${saved.name}" saved successfully!` })
        setBackendTheme(saved)
        setWorkingTheme(saved)
        setTemplatesVersion((version) => version + 1)
        navigate(
          [
            { href: '/theme/create', label: 'Themes' },
            { href: `/theme/${saved.id}`, label: saved.name }
          ],
          { preventScrollReset: true, replace: true }
        )
      })
      .catch((error) => setError(error instanceof Error ? error : new Error('Failed to save theme')))
      .finally(() => setSaving(false))
  }

  const onDelete = (theme: ThemeViewModel) => {
    if (deletingRef.current) return
    if (errorState) setError(null)

    deletingRef.current = true
    const controller = new AbortController()
    controllersRef.current.push(controller)
    setDeleting(true)

    entityServiceContext.themeService
      .delete(theme.id, { signal: controller.signal })
      .then(() => {
        setSuccess({ message: `Theme "${theme.name}" deleted successfully!` })
        navigate([{ href: '/theme/create', label: 'Themes' }], { preventScrollReset: true })
      })
      .catch((error) => setError(error instanceof Error ? error : new Error('Failed to delete theme')))
      .finally(() => {
        deletingRef.current = false
        setDeleting(false)
      })
  }

  return (
    <ThemeEdit
      theme={workingTheme}
      backendTheme={backendTheme}
      loadingTheme={loading}
      setTheme={setWorkingThemeFromPicker}
      onUpdate={onUpdate}
      onDelete={onDelete}
      savingTheme={saving}
      deletingTheme={deleting}
      templatesVersion={templatesVersion}
      onEditTheme={onEditTheme}
    />
  )
}

export default EditThemePage
