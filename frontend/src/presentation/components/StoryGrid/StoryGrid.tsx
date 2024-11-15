import { StoryPresentation, SearchStoriesRequest } from '@hatsuportal/presentation'
import { Box, Skeleton, TablePagination } from '@mui/material'
import { TablePaginationActions } from 'presentation/components/StoryTable/TablePaginationActions'

interface StoryGridProps {
  stories: StoryPresentation[]
  loading: boolean
  totalCount: number
  pageNumber: number
  storiesPerPage: number
  setStoryTableFilters: React.Dispatch<React.SetStateAction<SearchStoriesRequest>>
  goToStory: (storyId?: string) => void
}

export const StoryGrid: React.FC<StoryGridProps> = ({
  stories,
  loading,
  totalCount,
  pageNumber,
  storiesPerPage,
  setStoryTableFilters,
  goToStory
}) => {
  const handleChangePage = (event: unknown, newPage: number) => {
    setStoryTableFilters((_storyTableFilters) => {
      return {
        ..._storyTableFilters,
        pageNumber: newPage
      }
    })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStoryTableFilters((_storyTableFilters) => {
      return {
        ..._storyTableFilters,
        storiesPerPage: +event.target.value,
        pageNumber: 0
      }
    })
  }

  return (
    <Box>
      <Box
        sx={{
          margin: '0 0 0 0',
          display: 'grid',
          gridTemplateColumns: `repeat(${loading ? '6, 0fr' : 'auto-fill, minmax(180px, 1fr)'})`,
          gap: '1em',
          padding: '1em'
        }}
      >
        {loading
          ? Array.from(Array(6).keys()).map((index) => {
              return (
                <Skeleton
                  key={index}
                  variant="rounded"
                  width={120}
                  height={120}
                  animation="wave"
                  sx={{ margin: '0 0 0.5em 0', backgroundColor: 'rgba(0, 0, 0, 0.21)', opacity: 1.0 - index * 0.2 }}
                />
              )
            })
          : stories.map((story, index) => {
              return (
                <div key={`${story.id}-${index}`} onClick={() => goToStory(story.id)}>
                  {story.id}
                </div>
              )
            })}
      </Box>
      <TablePagination
        component="div"
        labelRowsPerPage="Stories per page"
        disabled={loading}
        rowsPerPageOptions={[2, 10, 25, 50, 75, 100, 200]}
        count={totalCount}
        rowsPerPage={storiesPerPage}
        page={pageNumber}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />
    </Box>
  )
}

export default StoryGrid
