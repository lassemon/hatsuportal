import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'
import { SearchPostsRequest } from '../../../../packages/contracts/src/post/requests/SearchPostsRequest'
import { PostGrid } from './PostGrid'
import PostSearchFilters from './PostSearchFilters'
import { SortableKeyEnum } from '@hatsuportal/common'
import { OrderEnum } from '@hatsuportal/common'

// TODO, file currently unused, remove after we have decided how to implement tag and other filter based search

export const defaultFilters = {
  postsPerPage: 10,
  pageNumber: 0,
  orderBy: SortableKeyEnum.TITLE,
  order: OrderEnum.Ascending
}

interface PostsWithSearchFiltersProps {
  onSearch: (filters: Omit<SearchPostsRequest, 'order' | 'orderBy'>) => void
  filters: SearchPostsRequest
  setFilters: React.Dispatch<React.SetStateAction<SearchPostsRequest>>
  loading: boolean
  posts: PostViewModel<PostViewModelDTO>[]
  totalCount: number
}

export const PostsWithSearchFilters: React.FC<PostsWithSearchFiltersProps> = ({
  onSearch,
  filters,
  setFilters,
  loading,
  posts,
  totalCount
}) => {
  return (
    <>
      <PostSearchFilters onSearch={onSearch} filters={filters} setFilters={setFilters} loading={loading} />
      <PostGrid
        posts={posts}
        totalCount={totalCount}
        pageNumber={filters.pageNumber && totalCount > 0 ? filters.pageNumber : defaultFilters.pageNumber}
        postsPerPage={filters.postsPerPage || defaultFilters.postsPerPage}
        loading={loading}
        setPostFilters={setFilters}
      />
    </>
  )
}
