import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Skeleton,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { SearchPostsRequest } from '@hatsuportal/contracts'
import { Fragment } from 'react'
import { PostViewModel, PostViewModelDTO } from '../../viewModels/PostViewModel'
import { EntityTypeEnum } from '@hatsuportal/common'
import TinyPostCard from '../TinyPostCard'

const MAX_PAGINATION_BUTTON_THRESHOLD = 7

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
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

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
        pageNumber: newPage - 1
      }
    })
  }

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setPostFilters((_postFilters) => {
      return {
        ..._postFilters,
        postsPerPage: +event.target.value,
        pageNumber: 0
      }
    })
  }

  const pageCount = Math.ceil(totalCount / postsPerPage)

  return (
    <Box>
      <Box
        sx={{
          margin: '0.5em',
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em' }}>
        <Pagination
          size={isSmall ? 'small' : 'large'}
          showFirstButton={pageCount > MAX_PAGINATION_BUTTON_THRESHOLD}
          showLastButton={pageCount > MAX_PAGINATION_BUTTON_THRESHOLD}
          count={pageCount}
          page={pageNumber + 1}
          onChange={handleChangePage}
        />
        <FormControl disabled={loading} variant="standard" size="small" sx={{ minWidth: isSmall ? 'auto' : '8em' }}>
          {isSmall ? null : <InputLabel id="posts-per-page-label">Posts per page</InputLabel>}
          <Select value={postsPerPage} onChange={handleChangeRowsPerPage}>
            {[10, 25, 50, 75, 100, 200].map((index) => {
              return (
                <MenuItem key={index} value={index}>
                  {index}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </Box>
    </Box>
  )
}

export default PostGrid
