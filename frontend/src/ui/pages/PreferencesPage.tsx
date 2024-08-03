import { Box, Button, Link, Switch, Typography } from '@mui/material'
import ColorSchemeSwitch from 'ui/shared/ui/ColorSchemeSwitch/ColorSchemeSwitch'
import SaveIcon from '@mui/icons-material/Save'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ColorSchemeEnum } from '@hatsuportal/common'
import { UpdatePreferencesRequest } from '@hatsuportal/contracts'
import { useAtom } from 'jotai'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { storePreferences, fetchAndStorePreferences, usePreferenceSetters } from 'ui/entities/user/state/storePreferences'
import { PreferencesViewModelDTO } from 'ui/entities/user/model/PreferencesViewModel'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { Link as RouterLink } from 'react-router-dom'
import { authAtom } from 'ui/entities/user/state/authAtom'
import ThemeCard from 'ui/entities/theme/ui/ThemeCard'
import { DiscoverOption, getDiscoverPath } from 'ui/features/discover/model/discoverOptions'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import Panel from 'ui/shared/ui/Panel/Panel'
import { useSize } from 'ui/shared/hooks/useSize'

interface FormInputs {
  colorScheme: `${ColorSchemeEnum}`
  selectedThemeId: string
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }
}

function toFormInputs(preferences: PreferencesViewModelDTO): FormInputs {
  return {
    colorScheme: preferences.colorScheme as `${ColorSchemeEnum}`,
    selectedThemeId: preferences.selectedTheme.id,
    notificationSettings: preferences.notificationSettings
  }
}

interface PreferencesUnavailableProps {
  onRetry: () => Promise<void>
}

const PreferencesUnavailable: React.FC<PreferencesUnavailableProps> = ({ onRetry }) => {
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState('')

  const handleRetry = async () => {
    setRetryError('')
    setRetrying(true)
    try {
      await onRetry()
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : 'Failed to load preferences')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body1">Preferences unavailable.</Typography>
      {retryError && (
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {retryError}
        </Typography>
      )}
      <Button variant="contained" onClick={handleRetry} disabled={retrying}>
        Retry
      </Button>
    </Box>
  )
}

interface PreferencesFormProps {
  preferences: PreferencesViewModelDTO
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ preferences }) => {
  const entityServiceContext = useEntityServiceContext()
  const setters = usePreferenceSetters()
  const [authState] = useAtom(authAtom)
  const navigate = useNavigate()
  const [savingPreferences, setSavingPreferences] = useState(false)
  const controllersRef = useRef<AbortController[]>([])
  const activeTheme = useMemo(() => new ThemeViewModel(preferences.selectedTheme), [preferences.selectedTheme])
  const currentUserId = authState.user?.id
  const canEditTheme = currentUserId !== undefined && activeTheme.createdById === currentUserId

  const { isTiny } = useSize()

  const onEditTheme = () => {
    navigate(
      [
        { href: '/theme/create', label: 'Themes' },
        { href: `/theme/${activeTheme.id}`, label: activeTheme.name }
      ],
      { preventScrollReset: true }
    )
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isSubmitting, isDirty }
  } = useForm<FormInputs>({
    defaultValues: toFormInputs(preferences)
  })

  useEffect(() => {
    return () => setters.setColorSchemePreview(null)
  }, [setters.setColorSchemePreview])

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  const updatePreferences = async (partial: UpdatePreferencesRequest) => {
    setSavingPreferences(true)
    try {
      const controller = new AbortController()
      controllersRef.current.push(controller)
      const preferences = await entityServiceContext.preferencesService.updatePreferences(partial, { signal: controller.signal })
      storePreferences(preferences, setters)
      reset(toFormInputs(preferences.toJSON()))
    } finally {
      setSavingPreferences(false)
    }
  }

  const onSubmit = (values: FormInputs) => {
    const partial: UpdatePreferencesRequest = {}
    ;(Object.keys(dirtyFields) as Array<keyof FormInputs>).forEach((key) => {
      if (key === 'colorScheme') {
        partial.colorScheme = values.colorScheme
      } else if (key === 'selectedThemeId') {
        partial.selectedThemeId = values.selectedThemeId
      } else if (key === 'notificationSettings') {
        partial.notificationSettings = values.notificationSettings
      }
    })

    if (Object.keys(partial).length > 0) {
      updatePreferences(partial)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        color: (theme) => theme.palette.getContrastText(theme.palette.background.default)
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexWrap: isTiny ? 'wrap' : 'nowrap' }}>
        <Panel
          sx={{
            flexDirection: 'column',
            flex: isTiny ? '1 1 100%' : 'auto'
          }}
        >
          <Typography variant="h3" sx={{ textAlign: isTiny ? 'center' : 'left' }}>
            Color Scheme
          </Typography>
          <Controller
            name="colorScheme"
            control={control}
            render={({ field: { value, onChange } }) => (
              <ColorSchemeSwitch
                value={value}
                onChange={onChange}
                onPreviewChange={(mode: `${ColorSchemeEnum}`) => setters.setColorSchemePreview(mode)}
              />
            )}
          />
        </Panel>
        <Panel
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flex: isTiny ? '1 1 100%' : 'auto',
            borderRadius: 2,
            backgroundColor: (theme) => theme.palette.background.default,
            padding: 2
          }}
        >
          <Typography variant="h3" sx={{ textAlign: isTiny ? 'center' : 'left' }}>
            Current Theme
          </Typography>
          <Box>
            <ThemeCard
              theme={activeTheme}
              selected
              previewEnabled={false}
              onSelect={() => {}}
              onEdit={canEditTheme ? onEditTheme : undefined}
              inUse
              disableHoverStyle={true}
            />
          </Box>
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            <Link component={RouterLink} to={getDiscoverPath(DiscoverOption.THEMES)} underline="hover">
              Discover more themes
            </Link>
          </Typography>
        </Panel>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography
          variant="h5"
          sx={{ padding: '0 0 0 0.5em', color: (theme) => theme.palette.getContrastText(theme.palette.background.paper) }}
        >
          Notifications
        </Typography>
        <Panel
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6">Email Notifications</Typography>
          <Controller
            name="notificationSettings.emailNotifications"
            control={control}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <Switch checked={value} onChange={(_event, checked) => onChange(checked)} onBlur={onBlur} inputRef={ref} />
            )}
          />
        </Panel>
        <Panel
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6">Push Notifications (Coming soon)</Typography>
          <Controller
            name="notificationSettings.pushNotifications"
            control={control}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <Switch checked={false} onChange={(_event, checked) => onChange(checked)} onBlur={onBlur} inputRef={ref} disabled />
            )}
          />
        </Panel>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <Button
          onClick={handleSubmit(onSubmit)}
          endIcon={<SaveIcon />}
          disabled={savingPreferences || isSubmitting || !isDirty}
          variant="contained"
          sx={{
            lineHeight: 'normal',
            backgroundColor: 'success.dark',
            margin: '0 0.5em 0 0',
            color: (theme) => theme.palette.success.contrastText,
            '&:hover': { backgroundColor: 'success.main' }
          }}
        >
          <Typography variant="button" sx={{ lineHeight: 'normal' }}>
            Save Changes
          </Typography>
        </Button>
      </Box>
    </Box>
  )
}

const PreferencesPage: React.FC = () => {
  const entityServiceContext = useEntityServiceContext()
  const [preferences] = useAtom(userPreferencesAtom)
  const setters = usePreferenceSetters()

  const handleRetry = async () => {
    await fetchAndStorePreferences(entityServiceContext.preferencesService, setters)
  }

  if (preferences === null) {
    return <PreferencesUnavailable onRetry={handleRetry} />
  }

  return <PreferencesForm preferences={preferences} />
}

export default PreferencesPage
