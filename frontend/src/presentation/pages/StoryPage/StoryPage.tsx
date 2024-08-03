import CreateStoryLayout from 'presentation/layouts/CreateStoryLayout'
import EditStoryLayout from 'presentation/layouts/EditStoryLayout'
import { useParams } from 'react-router-dom'

const StoryPage: React.FC = () => {
  let { storyId: urlStoryId } = useParams<{ storyId: string }>()

  return urlStoryId ? <EditStoryLayout /> : <CreateStoryLayout />
}

export default StoryPage
