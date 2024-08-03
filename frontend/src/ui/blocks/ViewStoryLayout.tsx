import { Box } from '@mui/material'
import StoryCard from 'ui/entities/story/ui/StoryCard'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/app/state/authAtom'
import EditButton from 'ui/shared/ui/Buttons/EditButton'

interface ViewStoryLayoutProps {
  story: StoryViewModel | null
  loadingStory?: boolean
  savingStory?: boolean
  onToggleViewMode?: () => void
}

export const ViewStoryLayout: React.FC<ViewStoryLayoutProps> = ({ story, loadingStory, savingStory, onToggleViewMode }) => {
  if (!story) return null

  const [authState] = useAtom(authAtom)

  return (
    <Box sx={{ position: 'relative' }}>
      {onToggleViewMode && authState.user?.id === story.createdById /* TODO: isAdmin check || authState.user.is*/ && (
        <EditButton onClick={onToggleViewMode} color="primary" sx={{ position: 'absolute', top: '0.5em', right: '0.5em', zIndex: 1 }} />
      )}
      <StoryCard story={story} loadingStory={loadingStory} />
      {/*
        When StoryComments is enabled:
        - Render comment body with the shared Markdown component (same as StoryCard).
        - Apply inputProps={{ maxLength: InputLimits.commentBody }} on the comment input form.
      */}
      {/* <StoryComments story={story} loadingStory={loadingStory} /> */}
    </Box>
  )
}
