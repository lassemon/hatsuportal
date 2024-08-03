import { Box, Skeleton, TablePagination } from '@mui/material'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { TablePaginationActions } from 'ui/shared/components/TablePaginationActions'
import { SearchPostsRequest } from '@hatsuportal/contracts'
import { Fragment } from 'react'
import { PostViewModel, PostViewModelDTO } from '../../viewModels/PostViewModel'
import { EntityTypeEnum } from '@hatsuportal/common'
import TinyPostCard from '../TinyPostCard'

interface PostGridProps {
  posts: PostViewModel<PostViewModelDTO>[]
  loading: boolean
  totalCount: number
  pageNumber: number
  postsPerPage: number
  setPostFilters: React.Dispatch<React.SetStateAction<SearchPostsRequest>>
}

export const PostGrid: React.FC<PostGridProps> = ({ posts, loading, totalCount, pageNumber, postsPerPage, setPostFilters }) => {
  const navigate = useNavigate()

  const redirectToPost = (post: PostViewModel<PostViewModelDTO>) => {
    if (post.postType === EntityTypeEnum.Story) {
      navigate([
        { href: '/stories', label: 'Stories' },
        { href: `/story/${post.id}`, label: `"${post.title}"` }
      ])
    } else {
      // TODO, there is no generic post url path, how to handle this?
      console.error(`No redirect url for post post type '${post.postType}'`)
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPostFilters((_postFilters) => {
      return {
        ..._postFilters,
        pageNumber: newPage
      }
    })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostFilters((_postFilters) => {
      return {
        ..._postFilters,
        postsPerPage: +event.target.value,
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
          gridTemplateColumns: `repeat(${loading ? '6, 0fr' : 'auto-fill, minmax(12em, 1fr)'})`,
          gap: '1em',
          padding: '0.5em 0'
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
          : posts.map((post, index) => {
              return (
                <Fragment key={`${post.id}-${index}`}>
                  <TinyPostCard post={post} onClick={() => redirectToPost(post)} />
                </Fragment>
              )
            })}
      </Box>
      <TablePagination
        sx={{
          background: (theme) => theme.palette.background.paper
        }}
        component="div"
        labelRowsPerPage="Posts per page"
        disabled={loading}
        rowsPerPageOptions={[2, 10, 25, 50, 75, 100, 200]}
        count={totalCount}
        rowsPerPage={postsPerPage}
        page={pageNumber}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />
    </Box>
  )
}

export default PostGrid
