import React, { useEffect, useRef, useState } from 'react'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
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
  Autocomplete
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import DeleteButton from 'ui/shared/components/Buttons/DeleteButton'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import BackButton from 'ui/shared/components/Buttons/BackButton'

import { useForm, Controller, useWatch } from 'react-hook-form'
import { CreateStoryRequest, UpdateStoryRequest } from '@hatsuportal/contracts'
import UploadImage from 'ui/shared/components/UploadImage'
import RemoveImageButton from 'ui/shared/components/Buttons/RemoveImageButton/RemoveImageButton'
import { AutocompleteOption } from 'ui/shared/components/Autocomplete/AutocompleteOption'
import { useDataServiceContext } from 'infrastructure/hooks/useDataServiceContext'
import { Chip } from 'ui/shared/components/Chip'

interface TagOption extends AutocompleteOption {
  slug: string
}
interface FormInputs {
  title: string
  content: string
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

/*
const dummyAvailableTags: TagOption[] = [
  { id: '421a58d0‑d2d3‑4f08‑9b1e‑59322b5900ec', slug: 'react', label: 'React' },
  { id: '421a58d0‑d2d3‑4f08‑9b2e‑59322b5900ec', slug: 'mui', label: 'MUI' },
  { id: '421a58d0‑d2d3‑4f08‑9b3e‑59322b5900ec', slug: 'typescript', label: 'TypeScript' },
  { id: '421a58d0‑d2d3‑4f08‑9b4e‑59322b5900ec', slug: 'clean-arch', label: 'Clean Architecture' },
  { id: '421a58d0-d2d3-4f08-9b1e-59322b5900ec', slug: 'recipe', label: 'Recipe' },
  { id: '421a58d0-d2d3-4f08-9b2e-59322b5900ec', slug: 'diary', label: 'Diary' },
  { id: '421a58d0-d2d3-4f08-9b3e-59322b5900ec', slug: 'chicken-recipe', label: 'Chicken Recipe' }
]
  */

function normaliseTag(input: string | TagOption): TagOption {
  if (typeof input === 'string') {
    const slug = input.trim().toLowerCase().replace(/\s+/g, '-')
    return { id: slug, slug, label: input.trim() }
  }
  // Already a TagOption
  return input
}

function mergeUnique(prev: TagOption[], next: (string | TagOption)[]): TagOption[] {
  const merged = [...prev, ...next.map(normaliseTag)]

  // Deduplicate by slug
  const seen = new Set<string>()
  return merged.filter((tag) => {
    const key = tag.slug.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const StoryEdit: React.FC<StoryEditProps> = ({ story, setStory, onUpdate, onClose, savingStory, deleteStory }) => {
  if (!story) return null

  const dataServiceContext = useDataServiceContext()
  const [availableTags, setAvailableTags] = useState<TagOption[]>([])
  const controllersRef = useRef<AbortController[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  const fetchAndSetAvailableTags = async () => {
    try {
      setLoadingTags(true)
      const controller = new AbortController()
      controllersRef.current.push(controller)
      const fetchedTags = await dataServiceContext.tagService.findAll({ signal: controller.signal }).finally(() => setLoadingTags(false))
      setAvailableTags(fetchedTags.map((tag) => ({ id: tag.id, slug: tag.slug, label: tag.name })))
    } catch (error) {
      console.error('Failed to fetch user:', error)
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
    formState: { dirtyFields, isSubmitting, isDirty }
  } = useForm<FormInputs>({
    defaultValues: {
      title: story.name,
      content: story.description,
      coverImageBase64: story.coverImage?.base64,
      coverImageSize: story.coverImage?.size,
      coverImageMimeType: story.coverImage?.mimeType,
      tags: []
    }
  })

  /* keep form in sync if parent replaces `story` prop */
  useEffect(() => {
    reset({
      title: story.name,
      content: story.description,
      coverImageBase64: story.coverImage?.base64,
      coverImageSize: story.coverImage?.size,
      coverImageMimeType: story.coverImage?.mimeType,
      tags: story.tags.map((tag) => ({ id: tag.id, slug: tag.slug, label: tag.name }))
    })
  }, [story, reset])

  const onSubmit = (values: FormInputs) => {
    const partial: UpdateStoryRequest = {}
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
        partial.name = values.title
      } else if (key === 'content') {
        partial.description = values.content
      }
      if (key === 'tags') {
        partial.tags = values.tags.map((tag) => {
          const newTag = tag.id === tag.slug
          return newTag
            ? { name: tag.label }
            : {
                id: tag.id
              }
        })
      }
    })

    // TODO, choose between onUpdate and onCreate
    // TODO, update availableTags list always when tag update finishes so we don't allow user
    // to add tags that might have just been deleted for good
    if (Object.keys(partial).length > 0)
      onUpdate?.(partial, () => {
        setLoadingTags(true)
        fetchAndSetAvailableTags().then(() => {
          setLoadingTags(false)
        })
      })
  }

  const previewImage = watch('coverImageBase64')
  const previewTags = useWatch({ control, name: 'tags', defaultValue: [] })

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
        borderRadius: '1em',
        gap: '1em',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          height: '40%',
          width: '100%',
          zIndex: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          borderRadius: '1em 1em 0 0',
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
        {onClose && <BackButton onClick={onClose} sx={{ position: 'absolute', top: '0.5em', right: '0.5em' }} />}

        <Box sx={{ display: 'flex', flexDirection: 'column-reverse', gap: '1em', flexWrap: 'wrap', width: '40%' }}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="story-title"
                label="Title"
                variant="filled"
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
                        borderBottom: (theme) => `2px solid ${darken(theme.palette.action.active, 0.4)}`
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
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.5em', alignItems: 'center', margin: '0 0 0 0.5em' }}>
            {previewTags.map((tag) => (
              <Chip size="small" key={tag.id} label={tag.label} onDelete={handleDeleteTag(tag)} />
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
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
                  const unique = mergeUnique([], newOpts)
                  onChange(unique)
                }}
                isOptionEqualToValue={(opt, val) => {
                  return typeof opt === 'string' ? opt === val : opt.slug === val.slug
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
                    sx={{
                      backgroundColor: (theme) => theme.palette.background.paper
                    }}
                  />
                )}
              />
            )}
          />
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1em' }}>
            {previewImage && <RemoveImageButton onClick={onRemoveCoverImage}>Remove Cover</RemoveImageButton>}
            <UploadImage id="cover-input" onUpload={onUploadCoverImage}>
              Upload Cover Image
            </UploadImage>
          </Box>
        </Box>
      </Box>

      <Box sx={{ padding: '0 0.5em 0.2em 0.5em' }}>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              id="story-content"
              multiline
              rows={6}
              label="Content"
              variant="standard"
              InputLabelProps={{
                shrink: true
              }}
              sx={{
                width: '100%',
                margin: '0 0 1em'
              }}
            />
          )}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
            disabled={savingStory || isSubmitting || !isDirty}
            variant="contained"
            sx={{
              lineHeight: 'normal',
              backgroundColor: 'success.dark',
              color: (theme) => theme.palette.success.contrastText,
              '&:hover': { backgroundColor: 'success.main' }
            }}
          >
            <Typography variant="button" sx={{ lineHeight: 'normal', fontWeight: 'bold' }}>
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
                Are you sure you want to delete <strong>{story?.name}</strong>
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
    </Box>
  )
}
