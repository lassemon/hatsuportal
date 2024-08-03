import React, { useState } from 'react'
import { StoryViewModel } from 'ui/features/story/viewModels/StoryViewModel'
import {
  Box,
  Button,
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { UpdateParam } from 'ui/state/atomWithAsyncStorage'
import SaveIcon from '@mui/icons-material/Save'
import DeleteButton from 'ui/shared/components/Buttons/DeleteButton'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'

interface StoryEditProps {
  story: StoryViewModel | null
  backendStory: StoryViewModel | null
  loadingStory: boolean
  setStory: (story: StoryViewModel | null) => void
  onSave: (story: StoryViewModel | null) => void
  savingStory: boolean
  deleteStory?: (story: StoryViewModel | null) => void
}

export const StoryEdit: React.FC<StoryEditProps> = ({ story, setStory, onSave, savingStory, deleteStory }) => {
  if (!story) return null

  const [areYouSureToDeleteDialogOpen, setAreYouSureToDeleteDialogOpen] = useState<boolean>(false)

  const internalSetItem = (update: UpdateParam<StoryViewModel | null>) => {
    let parsedValue = update instanceof Function ? update(story) : update
    setStory(parsedValue?.clone() || null)
  }

  const onChange = (name: string) => (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | SelectChangeEvent) => {
    const { value } = event.target

    internalSetItem((_story) => {
      if (_story) {
        return _story.clone({ [name]: String(value) })
      }
    })
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
        padding: '1em',
        borderRadius: '1em',
        gap: '1em'
      }}
    >
      <Typography variant="h4">Story Details</Typography>

      <TextField
        id="story-name"
        label="Name"
        value={story.name}
        onChange={onChange('name')}
        InputLabelProps={{
          shrink: true
        }}
      />

      <TextField
        id="story-description"
        multiline
        rows={6}
        label="Description"
        value={story.description}
        onChange={onChange('description')}
        InputLabelProps={{
          shrink: true
        }}
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
          onClick={() => onSave(story)}
          endIcon={<SaveIcon />}
          disabled={savingStory}
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
  )
}
