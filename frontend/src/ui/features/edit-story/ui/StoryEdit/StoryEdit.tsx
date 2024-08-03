import React, { useEffect, useRef, useState } from 'react'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import {
  Box,
  Button,
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Typography,
  lighten,
  darken,
  Autocomplete,
  InputLabel,
  FormControl,
  Select,
  MenuItem
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import DeleteButton from 'ui/shared/ui/Buttons/DeleteButton'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import BackButton from 'ui/shared/ui/Buttons/BackButton'

import { useForm, Controller, useWatch } from 'react-hook-form'
import { CreateStoryRequest, UpdateStoryRequest, InputLimits } from '@hatsuportal/contracts'
import UploadImage from 'ui/shared/ui/UploadImage'
import RemoveImageButton from 'ui/shared/ui/Buttons/RemoveImageButton/RemoveImageButton'
import { AutocompleteOption } from 'ui/shared/ui/Autocomplete/AutocompleteOption'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { Chip } from 'ui/shared/ui/Chip'
import Panel from 'ui/shared/ui/Panel/Panel'
import { useSize } from 'ui/shared/hooks/useSize'
import { ImageStateEnum, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { storyHasUnsavedEdits } from 'ui/entities/story/model/storyHasUnsavedEdits'
import { StoryCoverUnsavedBar } from 'ui/entities/story/ui/StoryCoverUnsavedBar'

const VisibilityDescriptions = {
  [VisibilityEnum.Public]: 'Visible to everyone',
  [VisibilityEnum.LoggedIn]: 'Visible to logged in users',
  [VisibilityEnum.Private]: 'Visible only to you'
}

interface TagOption extends AutocompleteOption {
  slug: string
}
interface FormInputs {
  title: string
  body: string
  visibility: VisibilityEnum
  tags: TagOption[]
  coverImageBase64?: string | null
  coverImageSize?: number
  coverImageMimeType?: string
}

interface StoryEditProps {
  story: StoryViewModel | null
  backendStory: StoryViewModel | null
  loadingStory: boolean
  setStory: (story: StoryViewModel | null) => void
  onCreate?: (story: CreateStoryRequest) => void
  onUpdate?: (story: UpdateStoryRequest, callback?: () => void) => void
  onClose?: () => void
  savingStory: boolean
  deleteStory?: (story: StoryViewModel | null) => void
}

/**
 * Converts a string or TagOption into a TagOption.
 * When the user types a new tag (string), we create a TagOption with id = slug.
 * This convention allows us to distinguish new vs existing tags in onSubmit:
 * - New tags: id === slug (both are the slugified string, e.g. "react")
 * - Existing tags: id is a UUID from the backend, slug is the human-readable slug
 */
function normaliseTag(input: string | TagOption): TagOption {
  if (typeof input === 'string') {
    const slug = input.trim().toLowerCase().replace(/\s+/g, '-')
    return { id: slug, slug, label: input.trim() }
  }
  // Already a TagOption (from availableTags or story.tags)
  return input
}

/**
 * Merges tag arrays and deduplicates by slug.
 * Used when the Autocomplete onChange fires with new selections.
 */
function mergeUnique(prev: TagOption[], next: (string | TagOption)[]): TagOption[] {
  const merged = [...prev, ...next.map(normaliseTag)]

  // Deduplicate by slug (same tag might appear as string or TagOption)
  const seen = new Set<string>()
  return merged.filter((tag) => {
    const key = tag.slug.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function formInputsToStoryDraft(story: StoryViewModel, values: FormInputs): StoryViewModel {
  const now = unixtimeNow()
  const coverImage =
    values.coverImageBase64 !== null && values.coverImageBase64 !== undefined
      ? {
          id: story.coverImage?.id ?? '',
          base64: values.coverImageBase64,
          size: values.coverImageSize ?? 0,
          mimeType: values.coverImageMimeType ?? '',
          createdById: story.coverImage?.createdById ?? story.createdById,
          createdByName: story.coverImage?.createdByName ?? '',
          createdAt: story.coverImage?.createdAt ?? now,
          updatedAt: now
        }
      : null
  return story.clone({
    title: values.title,
    body: values.body,
    visibility: values.visibility,
    coverImage,
    imageLoadState: coverImage ? ImageStateEnum.Available : ImageStateEnum.NotSet,
    tags: values.tags.map((tag) => ({
      id: tag.id,
      slug: tag.slug,
      name: tag.label,
      createdById: story.createdById,
      createdAt: now,
      updatedAt: now
    }))
  })
}

function formInputsFromStory(story: StoryViewModel): FormInputs {
  return {
    title: story.title,
    body: story.body,
    visibility: story.visibility,
    coverImageBase64: story.coverImage?.base64,
    coverImageSize: story.coverImage?.size,
    coverImageMimeType: story.coverImage?.mimeType,
    tags: story.tags.map((tag) => ({ id: tag.id, slug: tag.slug, label: tag.name }))
  }
}

function tagSignatureFromFormTags(tags: TagOption[]): string {
  return [...tags]
    .map((tag) => tag.slug.toLowerCase())
    .sort()
    .join('\n')
}

function buildUpdateRequestFromBaseline(
  values: FormInputs,
  baseline: StoryViewModel,
  mapTagsToRequest: (tags: TagOption[]) => UpdateStoryRequest['tags']
): UpdateStoryRequest {
  const base = formInputsFromStory(baseline)
  const partial: UpdateStoryRequest = {}
  if (values.title !== base.title) {
    partial.title = values.title
  }
  if (values.body !== base.body) {
    partial.body = values.body
  }
  if (values.visibility !== base.visibility) {
    partial.visibility = values.visibility
  }
  if (tagSignatureFromFormTags(values.tags) !== tagSignatureFromFormTags(base.tags)) {
    partial.tags = mapTagsToRequest(values.tags)
  }
  const valueCover = values.coverImageBase64 ?? null
  const baseCover = base.coverImageBase64 ?? null
  if (valueCover !== baseCover) {
    if (valueCover === null) {
      partial.image = null
    } else {
      partial.image = {
        base64: valueCover,
        size: values.coverImageSize,
        mimeType: values.coverImageMimeType
      }
    }
  }
  return partial
}

export const StoryEdit: React.FC<StoryEditProps> = ({
  story,
  backendStory,
  setStory,
  onCreate,
  onUpdate,
  onClose,
  savingStory,
  deleteStory
}) => {
  if (!story) return null

  const entityServiceContext = useEntityServiceContext()
  const [availableTags, setAvailableTags] = useState<TagOption[]>([])
  const controllersRef = useRef<AbortController[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  const { isSmall } = useSize()

  const fetchAndSetAvailableTags = async () => {
    try {
      setLoadingTags(true)
      const controller = new AbortController()
      controllersRef.current.push(controller)
      const fetchedTags = await entityServiceContext.tagService.findAll({ signal: controller.signal }).finally(() => setLoadingTags(false))
      setAvailableTags(fetchedTags.map((tag) => ({ id: tag.id, slug: tag.slug, label: tag.name })))
    } catch (error) {
      console.error('Failed to fetch available tags:', error)
    }
  }

  useEffect(() => {
    fetchAndSetAvailableTags()
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  const {
    control,
    handleSubmit,
    reset, // to refresh when prop changes
    watch,
    setValue,
    formState: { dirtyFields, isSubmitting }
  } = useForm<FormInputs>({
    defaultValues: {
      title: story.title,
      body: story.body,
      visibility: story.visibility,
      coverImageBase64: story.coverImage?.base64,
      coverImageSize: story.coverImage?.size,
      coverImageMimeType: story.coverImage?.mimeType,
      tags: story.tags.map((tag) => ({ id: tag.id, slug: tag.slug, label: tag.name }))
    }
  })

  /* keep form in sync if parent replaces `story` prop */
  useEffect(() => {
    reset(
      {
        title: story.title,
        body: story.body,
        visibility: story.visibility,
        coverImageBase64: story.coverImage?.base64,
        coverImageSize: story.coverImage?.size,
        coverImageMimeType: story.coverImage?.mimeType,
        tags: story.tags.map((tag) => ({ id: tag.id, slug: tag.slug, label: tag.name }))
      },
      { keepDirty: false, keepDirtyValues: false }
    )
  }, [story.id, backendStory?.updatedAt, reset])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const subscription = watch((values) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        setStory(formInputsToStoryDraft(story, values as FormInputs))
      }, 400)
    })
    return () => {
      subscription.unsubscribe()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [watch, setStory, story])

  const mapTagsToRequest = (tags: TagOption[]) =>
    tags.map((tag) => {
      const isNewTag = tag.id === tag.slug
      return isNewTag ? { name: tag.label } : { id: tag.id }
    })

  const onSubmit = (values: FormInputs) => {
    if (onCreate && backendStory === null) {
      const createPayload: CreateStoryRequest = {
        title: values.title,
        body: values.body,
        visibility: values.visibility,
        image:
          values.coverImageBase64 !== null && values.coverImageBase64 !== undefined
            ? {
                base64: values.coverImageBase64,
                size: values.coverImageSize ?? 0,
                mimeType: values.coverImageMimeType ?? ''
              }
            : null,
        tags: mapTagsToRequest(values.tags)
      }
      onCreate(createPayload)
      setStory(StoryViewModel.createEmpty())
      return
    }

    if (!backendStory) {
      return
    }
    const partial = buildUpdateRequestFromBaseline(values, backendStory, mapTagsToRequest)

    ;(Object.keys(dirtyFields) as Array<keyof FormInputs>).forEach((key) => {
      if (key === 'coverImageBase64') {
        if (values.coverImageBase64 === null) {
          partial.image = null
        } else {
          partial.image = {
            base64: values.coverImageBase64,
            size: values.coverImageSize,
            mimeType: values.coverImageMimeType
          }
        }
      } else if (key === 'title') {
        partial.title = values.title
      } else if (key === 'body') {
        partial.body = values.body
      } else if (key === 'visibility') {
        partial.visibility = values.visibility
      }
      if (key === 'tags') {
        partial.tags = mapTagsToRequest(values.tags)
      }
    })

    if (Object.keys(partial).length > 0) {
      onUpdate?.(partial, () => {
        setLoadingTags(true)
        fetchAndSetAvailableTags().then(() => {
          setLoadingTags(false)
        })
      })
    }
  }

  const previewImage = watch('coverImageBase64')
  const previewTags = useWatch({ control, name: 'tags', defaultValue: [] })

  const isCreateMode = backendStory === null && !!onCreate
  const hasUnsavedChanges = storyHasUnsavedEdits(story, backendStory, isCreateMode)

  const [areYouSureToDeleteDialogOpen, setAreYouSureToDeleteDialogOpen] = useState<boolean>(false)

  const onUploadCoverImage = async (base64: string, size: number, mimeType: string) => {
    setValue('coverImageBase64', base64, { shouldDirty: true })
    setValue('coverImageSize', size, { shouldDirty: true })
    setValue('coverImageMimeType', mimeType, { shouldDirty: true })
  }

  const handleDeleteTag = (tagToDelete: TagOption) => () => {
    setValue(
      'tags',
      previewTags.filter((tag) => tag.id !== tagToDelete.id),
      { shouldDirty: true }
    )
  }

  const onRemoveCoverImage = () => {
    setValue('coverImageBase64', null, { shouldDirty: true })
  }

  const onDelete = () => {
    setAreYouSureToDeleteDialogOpen(true)
  }

  const closeAreYouSureToDeleteDialog = (confirmDeleteStory?: boolean) => {
    if (confirmDeleteStory) {
      deleteStory?.(story)
    }
    setAreYouSureToDeleteDialogOpen(false)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: (theme) => theme.palette.background.paper,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          minHeight: '14em',
          width: '100%',
          zIndex: 0,
          display: 'flex',
          gap: 2,
          flexWrap: isSmall ? 'wrap' : 'nowrap',
          alignItems: isSmall ? 'flex-end' : 'flex-start',
          justifyContent: 'space-between',
          position: 'relative',
          background: (theme) =>
            `linear-gradient(110deg, ${theme.palette.action.active} 50%, ${darken(theme.palette.action.active, 0.1)}  50%, ${darken(
              theme.palette.action.active,
              0.1
            )} 52%, ${lighten(theme.palette.action.active, 0.8)} 52%, ${lighten(theme.palette.action.active, 0.8)} 0)`,
          ...(previewImage && { backgroundImage: `url(${previewImage})` }),
          backgroundSize: 'cover',
          backgroundPosition: 'center 10%'
        }}
      >
        <StoryCoverUnsavedBar visible={hasUnsavedChanges} />
        <Box
          sx={{
            display: 'flex',
            gap: '1em',
            flexWrap: 'wrap',
            width: isSmall ? '100%' : '60%',
            height: isSmall ? 'auto' : '100%',
            alignSelf: isSmall ? 'baseline' : 'auto'
          }}
        >
          <Box sx={{ flex: '1 1 100%', display: 'flex' }}>
            {onClose && <BackButton onClick={onClose} sx={{ margin: '0.2em', height: 'fit-content' }} />}
            <Controller
              name="title"
              control={control}
              rules={{
                maxLength: {
                  value: InputLimits.postTitle,
                  message: `Title must be at most ${InputLimits.postTitle} characters`
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="story-title"
                  label="Title"
                  variant="filled"
                  inputProps={{ maxLength: InputLimits.postTitle }}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      color: (theme) => theme.palette.getContrastText(theme.palette.action.active),
                      '&.Mui-focused': {
                        color: (theme) => theme.palette.getContrastText(theme.palette.action.active)
                      }
                    }
                  }}
                  sx={{
                    height: 'fit-content',
                    flex: '1 1 100%',
                    maxWidth: isSmall ? '100%' : '40%',
                    backgroundColor: (theme) => darken(theme.palette.action.active, 0.1),
                    '&& .MuiFilledInput-root': {
                      '&::before': {
                        borderBottom: (theme) => `1px solid ${theme.palette.getContrastText(theme.palette.action.active)}`
                      },
                      '&::after': {
                        borderBottom: (theme) => `2px solid ${theme.palette.getContrastText(theme.palette.action.active)}`
                      },
                      '&:hover': {
                        '&::before': {
                          borderBottom: (theme) => `1px solid ${darken(theme.palette.action.active, 0.4)}`
                        },
                        '&::after': {
                          borderBottom: (theme) => `2px solid ${theme.palette.getContrastText(theme.palette.action.active)}`
                        }
                      },
                      color: (theme) => theme.palette.getContrastText(theme.palette.action.active),
                      '& .MuiFilledInput-notchedOutline': {
                        borderColor: (theme) => theme.palette.getContrastText(theme.palette.action.active),
                        '&:hover': {
                          borderColor: (theme) => theme.palette.getContrastText(theme.palette.action.active)
                        }
                      }
                    }
                  }}
                />
              )}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '0.5em',
              alignItems: 'end',
              alignContent: 'end',
              margin: '0 0 0.5em 0.5em'
            }}
          >
            {previewTags.map((tag) => (
              <Chip size="small" key={tag.id} label={tag.label} onDelete={handleDeleteTag(tag)} />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: isSmall ? '100%' : '40%',
            height: isSmall ? 'auto' : '100%',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <FormControl
                  variant="filled"
                  sx={{
                    flex: '0 0 50%',
                    maxWidth: '100%',
                    backgroundColor: (theme) => darken(theme.palette.action.active, 0.1)
                  }}
                >
                  <InputLabel
                    shrink
                    sx={{
                      color: (theme) => theme.palette.getContrastText(theme.palette.action.active),
                      '&.Mui-focused': {
                        color: (theme) => theme.palette.getContrastText(theme.palette.action.active)
                      }
                    }}
                  >
                    Visibility
                  </InputLabel>
                  <Select
                    {...field}
                    label="Visibility"
                    sx={{
                      color: (theme) => theme.palette.getContrastText(theme.palette.action.active),
                      '& .MuiSvgIcon-root': {
                        color: (theme) => theme.palette.getContrastText(theme.palette.action.active)
                      }
                    }}
                  >
                    {Object.values(VisibilityEnum).map((option) => (
                      <MenuItem key={option} value={option} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {option.replaceAll('_', ' ')}
                        </Typography>
                        <Typography variant="body2" sx={{ padding: '0 0 0 0.5em', fontSize: '0.6em' }}>
                          {VisibilityDescriptions[option]}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="tags"
              control={control}
              defaultValue={previewTags}
              render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
                <Autocomplete
                  multiple
                  id="tags"
                  freeSolo
                  disableCloseOnSelect
                  limitTags={7}
                  loading={loadingTags}
                  options={availableTags}
                  renderTags={() => null}
                  value={value}
                  onChange={(_, newOpts) => {
                    // newOpts can be TagOption[] (from options) or string[] (freeSolo user input)
                    const unique = mergeUnique([], newOpts)
                    onChange(unique)
                  }}
                  isOptionEqualToValue={(opt, val) => {
                    return typeof opt === 'string' ? opt === val : opt.slug === val.slug
                  }}
                  sx={{
                    textAlign: 'end',
                    flex: '0 0 50%',
                    height: '100%'
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      label="Tags"
                      placeholder="Add tags"
                      inputRef={ref}
                      onKeyDown={(event: any) => {
                        if (event.key === 'Backspace') {
                          event.stopPropagation()
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        sx: {
                          height: '100%'
                        }
                      }}
                      sx={{
                        backgroundColor: (theme) => theme.palette.background.paper,
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  )}
                />
              )}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}
          >
            {previewImage && (
              <RemoveImageButton onClick={onRemoveCoverImage} sx={{ flex: '0 0 50%' }}>
                Remove Cover
              </RemoveImageButton>
            )}
            <UploadImage
              id="cover-input"
              onUpload={onUploadCoverImage}
              sx={{ flex: '0 0 50%', borderLeft: '1px solid #ccc', borderTop: '1px solid #ccc' }}
            >
              Add Cover
            </UploadImage>
          </Box>
        </Box>
      </Box>

      <Panel sx={{ borderRadius: isSmall ? 0 : (theme) => `0 0 ${theme.spacing(2)} ${theme.spacing(2)}` }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0 0.5em 0.2em 0.5em' }}>
          <Controller
            name="body"
            control={control}
            rules={{
              maxLength: {
                value: InputLimits.storyBody,
                message: `Body must be at most ${InputLimits.storyBody} characters`
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                id="story-body"
                multiline
                label="Body"
                variant="standard"
                inputProps={{ maxLength: InputLimits.storyBody }}
                InputLabelProps={{
                  shrink: true
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  margin: '0 0 1em',
                  '& .MuiInputBase-root': {
                    flexGrow: 1,
                    alignItems: 'stretch', // Makes the input area fill the height
                    height: '100%'
                  },
                  '& .MuiInputBase-input': {
                    height: '100% !important', // Forces the textarea to fill the InputBase
                    overflow: 'auto !important'
                  }
                }}
              />
            )}
          />
          <Box sx={{ display: 'flex', justifyContent: deleteStory ? 'space-between' : 'flex-end' }}>
            {deleteStory && (
              <Tooltip title={'Delete story'} placement="top-end">
                <div>
                  <DeleteButton onClick={onDelete} Icon={DeleteForeverIcon} />
                </div>
              </Tooltip>
            )}
            <Button
              onClick={handleSubmit(onSubmit)}
              endIcon={<SaveIcon />}
              disabled={savingStory || isSubmitting || !hasUnsavedChanges}
              variant="contained"
              sx={{
                lineHeight: 'normal',
                backgroundColor: 'success.dark',
                color: (theme) => theme.palette.success.contrastText,
                '&:hover': { backgroundColor: 'success.main' },
                padding: '1em'
              }}
            >
              <Typography variant="button" sx={{ lineHeight: 'normal' }}>
                Save
              </Typography>
            </Button>
            <Dialog
              open={areYouSureToDeleteDialogOpen}
              onClose={() => closeAreYouSureToDeleteDialog()}
              PaperProps={{ sx: { padding: '0.5em' } }}
            >
              <DialogTitle id={`are-you-sure-to-delete`} sx={{ fontWeight: 'bold' }}>{`Are you sure`}</DialogTitle>
              <DialogContent>
                <Typography variant="body2" paragraph={false}>
                  Are you sure you want to delete <strong>{story?.title}</strong>
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'space-between', alignStories: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginRight: '6em' }}>
                  <Button variant="outlined" color="secondary" onClick={() => closeAreYouSureToDeleteDialog()}>
                    Cancel
                  </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.5em' }}>
                  <Button variant="outlined" color="error" onClick={() => closeAreYouSureToDeleteDialog(true)}>
                    Yes, delete
                  </Button>
                </div>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Panel>
    </Box>
  )
}
