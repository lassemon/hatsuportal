import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { ColorSchemeEnum } from '@hatsuportal/common'
import { useColorScheme } from 'ui/shared/hooks/useColorScheme'
import { usePreferenceSetters } from 'ui/entities/user/state/storePreferences'
import { useCallback, useEffect, useRef, useState } from 'react'
import ThemeColorSchemePanel from './ThemeColorSchemePanel'
import { useThemeColorPreview } from '../model/useThemeColorPreview'
import { DEFAULT_TEMPLATE_ID, FormInputs, themeToCreateFormInputs, themeToFormEditInputs } from '../model/themeEditForm'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { buildPreviewTheme, parseInputColors } from '../model/buildPreviewTheme'
import { CreateThemeRequest, DEFAULT_THEME_COLORS, ThemeColors, UpdateThemeRequest } from '@hatsuportal/contracts'
import { useAtom } from 'jotai'
import { errorAtom } from 'ui/shared/state/errorAtom'
import SaveIcon from '@mui/icons-material/Save'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { ThemeList } from 'ui/blocks/ThemeList'
import { PopoverIcon } from 'ui/shared/ui/PopoverIcon'
import HelpIcon from '@mui/icons-material/Help'
import { useApplyThemePreference } from 'ui/entities/user/hooks/useApplyThemePreference'
import { useApplyColorSchemePreference } from 'ui/entities/user/hooks/useApplyColorSchemePreference'
import { TextDeleteButton } from 'ui/shared/ui/Buttons/DeleteButton'
import { useSize } from 'ui/shared/hooks/useSize'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'
import { useNavigate } from 'ui/shared/hooks/useNavigate'

const COLOR_HELPER = `Input colors work in hex, rgb, hsl, and keyword formats:
e.g. #0C2A28, rgb(12, 42, 40), hsl(160, 70%, 20%), green, whitesmoke etc.
`

interface ThemeEditProps {
  /** Working copy being edited */
  theme: ThemeViewModel | null
  /** Last saved server version; null = create mode */
  backendTheme: ThemeViewModel | null
  loadingTheme: boolean
  setTheme: (theme: ThemeViewModel | null) => void
  onCreate?: (request: CreateThemeRequest) => void
  onUpdate?: (themeId: string, request: UpdateThemeRequest) => void
  onDelete?: (theme: ThemeViewModel) => void
  savingTheme: boolean
  deletingTheme?: boolean
  templatesVersion?: number
  onEditTheme: (theme: ThemeViewModel) => void
  selectedTemplateId?: string | null
}

const ThemeEdit: React.FC<ThemeEditProps> = ({
  theme,
  backendTheme,
  loadingTheme,
  setTheme,
  onCreate,
  onUpdate,
  onDelete,
  savingTheme,
  deletingTheme,
  templatesVersion = 0,
  onEditTheme,
  selectedTemplateId: selectedTemplateIdProp
}) => {
  if (loadingTheme || !theme) {
    return <LoadingSkeleton skeletonProps={{ height: '6em' }} />
  }

  const setters = usePreferenceSetters()
  const selectedColorScheme = useColorScheme()
  const [activeScheme, setActiveScheme] = useState<`${ColorSchemeEnum}`>(selectedColorScheme)
  const entityServiceContext = useEntityServiceContext()
  const controllersRef = useRef<AbortController[]>([])
  const [errorState, setError] = useAtom(errorAtom)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [templates, setTemplates] = useState<ThemeViewModel[]>([])
  const [loadingThemes, setLoadingThemes] = useState(false)
  const [internalSelectedTemplateId, setInternalSelectedTemplateId] = useState<string | null>(() =>
    backendTheme?.id && backendTheme.id !== DEFAULT_TEMPLATE_ID ? backendTheme.id : null
  )
  const isControlledSelection = selectedTemplateIdProp !== undefined
  const selectedTemplateId = isControlledSelection ? selectedTemplateIdProp : internalSelectedTemplateId

  const { activeThemeId, applyingThemeId, onUseTheme } = useApplyThemePreference()
  const { activeColorScheme, applyingColorScheme, onUseColorScheme } = useApplyColorSchemePreference()
  const editingThemeId = backendTheme?.id && backendTheme.id !== DEFAULT_TEMPLATE_ID ? backendTheme.id : null

  /**
   * True when editing a theme that already exists in the backend.
   *
   * CreateThemePage passes backendTheme=null (nothing saved yet).
   * EditThemePage passes the loaded saved theme.
   *
   * The form may already contain colors/name from a template, but until backendTheme
   * points to a real saved theme, this stays in create mode.
   */
  const isEditMode = backendTheme?.id != null && backendTheme.id !== DEFAULT_TEMPLATE_ID

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting, isDirty }
  } = useForm<FormInputs>({
    defaultValues: themeToFormEditInputs(theme)
  })

  const hasExplicitTemplateChoice = selectedTemplateId !== null
  const enableThemePreview = isEditMode || hasExplicitTemplateChoice || (!isEditMode && isDirty)
  const treatHighlightAsSelected = !isEditMode && !hasExplicitTemplateChoice

  const listHighlightedThemeId = isEditMode ? selectedTemplateId : (selectedTemplateId ?? activeThemeId ?? null)

  const setThemePreviewIfEnabled = useCallback(
    (colors: ThemeColors | null) => {
      if (enableThemePreview) {
        setters.setThemePreview(colors)
      }
    },
    [enableThemePreview, setters.setThemePreview]
  )

  const navigate = useNavigate()

  const { isTiny } = useSize()

  useEffect(() => {
    if (!theme) return
    reset(themeToFormEditInputs(theme))
    if (isEditMode) {
      setters.setThemePreview(theme.displayColors)
    }
  }, [theme, reset, setters.setThemePreview, isEditMode])

  const { fieldErrors } = useThemeColorPreview(control, setThemePreviewIfEnabled)

  useEffect(() => {
    async function loadThemes() {
      const controller = new AbortController()
      controllersRef.current.push(controller)
      try {
        setLoadingThemes(true)
        const themes = await entityServiceContext.themeService.findAll({ signal: controller.signal })
        setTemplates(themes)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        setError(error instanceof Error ? error : new Error('Failed to load themes'))
      } finally {
        setLoadingThemes(false)
      }
    }
    loadThemes()
  }, [entityServiceContext.themeService, templatesVersion, setError])

  useEffect(() => {
    if (isControlledSelection) return
    if (backendTheme?.id && backendTheme.id !== DEFAULT_TEMPLATE_ID) {
      setInternalSelectedTemplateId(backendTheme.id)
    }
  }, [backendTheme?.id, isControlledSelection])

  const handleSelectTemplate = (template: ThemeViewModel) => {
    if (isEditMode) return

    if (!isControlledSelection) {
      setInternalSelectedTemplateId(template.id)
    }
    setTheme(template) // parent sets selectedSourceTemplateId when controlled
    reset(themeToCreateFormInputs(template))
    setters.setThemePreview(template.displayColors)
  }

  const selectScheme = (scheme: `${ColorSchemeEnum}`) => {
    setActiveScheme(scheme)
    setters.setColorSchemePreview(scheme)
  }

  const restoreEditorPreviewAfterPreferenceSave = useCallback(
    (scheme: `${ColorSchemeEnum}`) => {
      setters.setColorSchemePreview(scheme)
      if (!enableThemePreview) return
      const values = getValues()
      const preview = buildPreviewTheme({ light: values.lightColors, dark: values.darkColors })
      if (preview) {
        setters.setThemePreview(preview)
      }
    },
    [enableThemePreview, getValues, setters.setColorSchemePreview, setters.setThemePreview]
  )

  const handleUseScheme = (scheme: `${ColorSchemeEnum}`) => {
    setActiveScheme(scheme)
    const apply = onUseColorScheme?.(scheme)
    if (apply) {
      void apply.then(() => restoreEditorPreviewAfterPreferenceSave(scheme))
    }
  }

  useEffect(() => {
    setters.setColorSchemePreview(activeScheme)
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  useEffect(() => {
    return () => {
      setters.setColorSchemePreview(null)
      setters.setThemePreview(null)
    }
  }, [setters.setColorSchemePreview, setters.setThemePreview])

  useEffect(() => {
    if (activeColorScheme) {
      setActiveScheme(activeColorScheme)
    }
  }, [activeColorScheme])

  const onSubmit = handleSubmit((values) => {
    if (errorState) setError(null)

    const lightColors = parseInputColors(values.lightColors, DEFAULT_THEME_COLORS.lightColors)
    const darkColors = parseInputColors(values.darkColors, DEFAULT_THEME_COLORS.darkColors)

    if (!lightColors || !darkColors) {
      setError(new Error('Please fill in all color fields with valid colors.'))
      return
    }

    const payload = { name: values.name.trim(), lightColors, darkColors }

    if (backendTheme?.id && backendTheme.id !== DEFAULT_TEMPLATE_ID) {
      onUpdate?.(backendTheme.id, payload)
    } else {
      onCreate?.(payload)
    }
  })

  const canDelete = isEditMode && onDelete != null && backendTheme?.id !== '00000000-0000-0000-0000-000000000001' // default theme

  const openDeleteDialog = () => setIsDeleteDialogOpen(true)

  const closeDeleteDialog = (confirmed?: boolean) => {
    setIsDeleteDialogOpen(false)
    if (confirmed && backendTheme && !deletingTheme) {
      onDelete?.(backendTheme)
    }
  }

  return (
    <>
      <Box sx={{ padding: '2em 0' }}>
        <Box sx={{ padding: '0 0 0 0.5em' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2
            }}
          >
            <Box>
              <Typography variant="h3">{isEditMode ? 'Edit Theme' : 'Create Theme'}</Typography>
              <Typography variant="body2" sx={{ margin: '0.5em 0 0 0.5em' }}>
                {isEditMode ? '' : 'Click a theme below to use it as a starting template.'}
              </Typography>
            </Box>
            {canDelete && (
              <TextDeleteButton
                onClick={openDeleteDialog}
                disabled={deletingTheme || savingTheme}
                text="Delete Theme"
                sx={{ margin: '0 0.5em 0 0' }}
              />
            )}
          </Box>
          <Controller
            name="name"
            control={control}
            rules={{
              validate: (value) => {
                if (typeof value !== 'string' || !value.trim()) {
                  return 'Theme name is required'
                }
                return true
              }
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Theme name"
                variant="outlined"
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ mb: 3, maxWidth: 400 }}
              />
            )}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: isTiny ? 0 : 2,
            mt: 4,
            position: 'relative',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <PopoverIcon content={COLOR_HELPER} sx={{ textAlign: 'right', position: 'absolute', left: 0, top: -45 }}>
            <IconButton aria-label="help" sx={{ backgroundColor: 'transparent', '&:hover': { backgroundColor: 'transparent' } }}>
              <HelpIcon />
            </IconButton>
          </PopoverIcon>
          <ThemeColorSchemePanel
            mode="light"
            title="Light theme"
            selected={activeScheme === ColorSchemeEnum.Light}
            onSelect={() => selectScheme(ColorSchemeEnum.Light)}
            control={control}
            fieldErrors={fieldErrors.light}
            onUseScheme={onUseColorScheme ? () => handleUseScheme(ColorSchemeEnum.Light) : undefined}
            schemeInUse={activeColorScheme === ColorSchemeEnum.Light}
            useSchemeLoading={applyingColorScheme === ColorSchemeEnum.Light}
          />
          <ThemeColorSchemePanel
            mode="dark"
            title="Dark theme"
            selected={activeScheme === ColorSchemeEnum.Dark}
            onSelect={() => selectScheme(ColorSchemeEnum.Dark)}
            control={control}
            fieldErrors={fieldErrors.dark}
            onUseScheme={onUseColorScheme ? () => handleUseScheme(ColorSchemeEnum.Dark) : undefined}
            schemeInUse={activeColorScheme === ColorSchemeEnum.Dark}
            useSchemeLoading={applyingColorScheme === ColorSchemeEnum.Dark}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isTiny ? 'flex-start' : 'flex-end',
            mt: 4,
            gap: 1,
            flexWrap: isTiny ? 'wrap' : 'nowrap'
          }}
        >
          <Button
            onClick={() => {
              navigate([])
            }}
            disabled={!isDirty}
            variant="contained"
            sx={{
              lineHeight: 'normal',
              backgroundColor: (theme) => theme.palette.warning.main,
              color: (theme) => theme.palette.getContrastText(theme.palette.warning.main),
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <Typography variant="button" sx={{ lineHeight: 'normal' }}>
              Cancel
            </Typography>
          </Button>
          <Button
            onClick={onSubmit}
            endIcon={<SaveIcon />}
            disabled={savingTheme || isSubmitting || !isDirty}
            variant="contained"
            sx={{
              lineHeight: 'normal',
              backgroundColor: 'action.active',
              color: (theme) => theme.palette.getContrastText(theme.palette.action.active),
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <Typography variant="button" sx={{ lineHeight: 'normal' }}>
              {isEditMode ? 'Update Theme' : 'Create Theme'}
            </Typography>
          </Button>
        </Box>
      </Box>
      <ThemeList
        loading={loadingThemes}
        themes={templates}
        selectedThemeId={selectedTemplateId}
        highlightedThemeId={listHighlightedThemeId}
        treatHighlightAsSelected={treatHighlightAsSelected}
        onSelectTheme={handleSelectTemplate}
        onEditTheme={onEditTheme}
        previewEnabled={!isEditMode}
        activeThemeId={activeThemeId}
        onUseTheme={onUseTheme}
        applyingThemeId={applyingThemeId}
        editingThemeId={editingThemeId}
      />

      <Dialog open={isDeleteDialogOpen} onClose={() => closeDeleteDialog()} PaperProps={{ sx: { padding: '0.5em' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Are you sure?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{backendTheme?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button variant="outlined" color="secondary" onClick={() => closeDeleteDialog()}>
            Cancel
          </Button>
          <Button variant="outlined" color="error" onClick={() => closeDeleteDialog(true)} disabled={deletingTheme}>
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ThemeEdit
