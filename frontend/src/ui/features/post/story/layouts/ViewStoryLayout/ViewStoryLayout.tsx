import { Box } from '@mui/material'
import StoryCard from 'ui/features/post/story/components/StoryCard'
import { StoryViewModel } from '../../viewModels/StoryViewModel'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'
import EditButton from 'ui/shared/components/Buttons/EditButton'

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
    <Box sx={{ position: 'relative', height: '100%' }}>
      {onToggleViewMode && authState.user?.id === story.createdById /* TODO: isAdmin check || authState.user.is*/ && (
        <EditButton onClick={onToggleViewMode} color="primary" sx={{ position: 'absolute', top: '0.5em', right: '0.5em', zIndex: 1 }} />
      )}
      <StoryCard story={story} loadingStory={loadingStory} />
      {/* <StoryComments story={story} loadingStory={loadingStory} /> */}
    </Box>
  )
}
