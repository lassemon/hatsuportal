import { Box, FormControl, InputLabel, MenuItem, Pagination, Select, SelectChangeEvent } from '@mui/material'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { SearchPostsRequest } from '@hatsuportal/contracts'
import { Fragment } from 'react'
import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'
import { EntityTypeEnum } from '@hatsuportal/common'
import TinyPostCard from 'ui/entities/post/ui/TinyPostCard'
import { useSize } from 'ui/shared/hooks/useSize'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'

// TODO, file currently unused, remove after we have decided how to implement tag and other filter based search

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
  const { isSmall } = useSize()

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
          gridTemplateColumns: {
            xs: 'repeat(1, 100%)',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(auto-fill, minmax(12em, 1fr))'
          },
          gap: '1em',
          padding: '0.5em 0'
        }}
      >
        {loading
          ? Array.from(Array(6).keys()).map((index) => {
              return (
                <LoadingSkeleton
                  key={index}
                  skeletonProps={{
                    height: '8em',
                    sx: {
                      margin: '0 0 0.5em 0',
                      backgroundColor: 'rgba(0, 0, 0, 0.21)',
                      opacity: 1.0 - index * 0.15
                    }
                  }}
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
