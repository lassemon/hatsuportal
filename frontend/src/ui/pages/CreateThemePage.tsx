import React, { useEffect, useRef, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { CreateThemeRequest } from '@hatsuportal/contracts'
import ThemeEdit from 'ui/features/edit-theme'
import {
  createDefaultThemeTemplate,
  createInitialDraftTheme,
  DEFAULT_TEMPLATE_ID,
  themeToDraftTemplate
} from 'ui/features/edit-theme/model/themeEditForm'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useRedirectToFrontPageIfNotLoggedIn } from 'ui/shared/hooks/useRedirect'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { successAtom } from 'ui/shared/state/successAtom'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'

const CreateThemePage: React.FC = () => {
  useRedirectToFrontPageIfNotLoggedIn()

  const entityServiceContext = useEntityServiceContext()
  const navigate = useNavigate()
  const preferences = useAtomValue(userPreferencesAtom)
  const [draftTheme, setDraftTheme] = useState<ThemeViewModel>(() => createInitialDraftTheme(preferences))
  const [saving, setSaving] = useState(false)
  const controllersRef = useRef<AbortController[]>([])
  const [errorState, setError] = useAtom(errorAtom)
  const setSuccess = useSetAtom(successAtom)
  const [selectedSourceTemplateId, setSelectedSourceTemplateId] = useState<string | null>(null)

  useEffect(() => {
    return () => controllersRef.current.forEach((controller) => controller.abort())
  }, [])

  const setDraftThemeFromPicker = (theme: ThemeViewModel | null) => {
    if (!theme || theme.id === DEFAULT_TEMPLATE_ID) {
      setSelectedSourceTemplateId(null)
      setDraftTheme(createDefaultThemeTemplate())
      return
    }
    setSelectedSourceTemplateId(theme.id)
    setDraftTheme(themeToDraftTemplate(theme))
  }

  const onEditTheme = (theme: ThemeViewModel) => {
    navigate(
      [
        { href: '/theme/create', label: 'Themes' },
        { href: `/theme/${theme.id}`, label: theme.name }
      ],
      { preventScrollReset: true }
    )
  }

  const onCreate = (request: CreateThemeRequest) => {
    if (errorState) setError(null)

    const controller = new AbortController()
    controllersRef.current.push(controller)
    setSaving(true)

    entityServiceContext.themeService
      .create(request, { signal: controller.signal })
      .then((saved) => {
        setSuccess({ message: `Theme "${saved.name}" created successfully!` })
        navigate(
          [
            { href: '/theme/create', label: 'Themes' },
            { href: `/theme/${saved.id}`, label: saved.name }
          ],
          { preventScrollReset: true }
        )
      })
      .catch((error) => setError(error instanceof Error ? error : new Error('Failed to create theme')))
      .finally(() => setSaving(false))
  }

  return (
    <ThemeEdit
      theme={draftTheme}
      backendTheme={null}
      loadingTheme={false}
      setTheme={setDraftThemeFromPicker}
      selectedTemplateId={selectedSourceTemplateId}
      onCreate={onCreate}
      savingTheme={saving}
      onEditTheme={onEditTheme} // passed so the themelist edit buttons work
    />
  )
}

export default CreateThemePage
