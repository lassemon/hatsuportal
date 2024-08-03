import { Box } from '@mui/material'
import PageHeader from 'ui/shared/ui/PageHeader'
import { DiscoverPostsPanel } from 'ui/features/discover/ui/DiscoverPostsPanel'

const AllStoriesPage: React.FC = () => {
  return (
    <Box sx={{ margin: '1em 0' }}>
      <PageHeader variant="h5" sx={{ margin: '0 0 0 0.5em' }}>
        Stories
      </PageHeader>
      <DiscoverPostsPanel />
    </Box>
  )
}

export default AllStoriesPage
