import { OrderEnum, SortableKeyEnum } from '@hatsuportal/common'
import { SearchPostsRequest } from '@hatsuportal/contracts'
import { Box, Chip, Typography } from '@mui/material'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import _ from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PostGrid from 'ui/features/post/common/components/PostGrid'
import PostSearchFilters from 'ui/features/post/common/PostSearchFilters'
import { PostViewModel, PostViewModelDTO } from 'ui/features/post/common/viewModels/PostViewModel'
import { authAtom } from 'ui/state/authAtom'
import { errorAtom } from 'ui/state/errorAtom'

const postTypes = [
  { label: 'All', value: 'all' },
  { label: 'Stories', value: 'stories' }
]

export const defaultFilters = {
  postsPerPage: 10,
  pageNumber: 0,
  orderBy: SortableKeyEnum.TITLE,
  order: OrderEnum.Ascending
}

const localStorageFiltersAtom = atomWithStorage<SearchPostsRequest>(
  'localPostFiltersAtom',
  defaultFilters,
  {
    getItem: (key, initialValue) => {
      const storedStory = JSON.parse(localStorage.getItem(key) || 'null')
      return storedStory || initialValue
    },
    setItem: (key, newValue) => {
      if (newValue === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify({ ...newValue }))
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key)
    }
  },
  { getOnInit: true }
)

const constructFilters = (urlFilters: Partial<SearchPostsRequest>, localStorageFilters: SearchPostsRequest): SearchPostsRequest => {
  if (!_.isEmpty(urlFilters)) {
    return {
      postsPerPage: urlFilters.postsPerPage || defaultFilters.postsPerPage,
      pageNumber: urlFilters.pageNumber || defaultFilters.pageNumber,
      search: urlFilters.search || undefined,
      order: (urlFilters.order as OrderEnum) || defaultFilters.order,
      orderBy: urlFilters.orderBy || defaultFilters.orderBy,
      visibility: (urlFilters.visibility as SearchPostsRequest['visibility']) || []
    }
  } else {
    return localStorageFilters
  }
}

const getFiltersFromUrl = (searchParams: URLSearchParams): Partial<SearchPostsRequest> => {
  return _({
    postsPerPage: parseInt(searchParams.get('postsPerPage') || '') || undefined,
    pageNumber: parseInt(searchParams.get('pageNumber') || '') || undefined,
    search: searchParams.get('search') || undefined,
    order: (searchParams.get('order') as OrderEnum) || undefined,
    orderBy: (searchParams.get('orderBy') as SortableKeyEnum) || undefined,
    visibility: !_.isEmpty(searchParams.getAll('visibility'))
      ? (searchParams.getAll('visibility') as SearchPostsRequest['visibility'])
      : undefined
  })
    .omitBy(_.isUndefined)
    .value()
}

const convertFiltersToUrlSearchParams = (postFilters: SearchPostsRequest, loggedIn: boolean) => {
  return {
    pageNumber: String(postFilters.pageNumber || defaultFilters.pageNumber),
    postsPerPage: String(postFilters.postsPerPage || defaultFilters.postsPerPage),
    order: String(postFilters.order || defaultFilters.order),
    orderBy: String(postFilters.orderBy || defaultFilters.orderBy),
    visibility: postFilters.visibility || [],
    ...(postFilters.search && postFilters.search ? { search: postFilters.search } : { search: '' })
  }
}

const FrontPage: React.FC = () => {
  const entityServiceContext = useEntityServiceContext()
  const [authState] = useAtom(authAtom)

  const fetchPostsControllerRef = useRef<AbortController | null>(null)

  const [selectedPostType, setSelectedPostType] = useState<string>(postTypes[0].value)
  const [loadingPostList, setLoadingPostList] = useState(false)
  let [searchParams, setSearchParams] = useSearchParams()
  const urlFilters = getFiltersFromUrl(searchParams)

  const [localStorageFilters, setLocalStorageFilters] = useAtom(localStorageFiltersAtom)
  const [postFilters, setPostFilters] = useState<SearchPostsRequest>(constructFilters(urlFilters, localStorageFilters))

  const [postList, setPostList] = useState<PostViewModel<PostViewModelDTO>[]>([])
  const [totalCount, setTotalCount] = React.useState(0)

  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))

  useEffect(() => {
    setSearchParams(convertFiltersToUrlSearchParams(postFilters, authState.loggedIn))
    setLocalStorageFilters(postFilters)
  }, [postFilters])

  const fetchAndSetPosts = async (filters: SearchPostsRequest) => {
    try {
      setLoadingPostList(true)
      const controller = new AbortController()
      fetchPostsControllerRef.current = controller
      const postList = await entityServiceContext.postService.search(filters, { signal: controller.signal }).finally(() => {
        setLoadingPostList(false)
      })
      setPostList(postList.posts)
      setTotalCount(postList.totalCount)
    } catch (error: any) {
      if (!(error instanceof DOMException)) {
        setError(error)
      }
    }
  }

  const onSearch = (filters: Omit<SearchPostsRequest, 'order' | 'orderBy'>) => {
    const allFilters = { ...defaultFilters, ...filters, order: postFilters.order, orderBy: postFilters.orderBy }
    setPostFilters(allFilters)
    fetchAndSetPosts(allFilters)
  }

  useEffect(() => {
    setSearchParams(convertFiltersToUrlSearchParams(postFilters, authState.loggedIn))
    setLocalStorageFilters(postFilters)
  }, [postFilters])

  useEffect(() => {
    setPostFilters({ ...postFilters, visibility: authState.loggedIn ? postFilters.visibility : [] })
    fetchAndSetPosts({ ...defaultFilters, ...postFilters })
  }, [authState.loggedIn, postFilters.postsPerPage, postFilters.pageNumber, postFilters.order, postFilters.orderBy])

  useEffect(() => {
    return () => {
      fetchPostsControllerRef?.current?.abort()
    }
  }, [])

  return (
    <Box sx={{ margin: '2em 0' }}>
      <Typography variant="h5">Discover</Typography>
      <Box sx={{ display: 'flex', gap: '0.5em', marginTop: '1em' }}>
        {postTypes.map((postType) => (
          <Chip
            key={postType.value}
            variant={selectedPostType === postType.value ? 'filled' : 'outlined'}
            label={postType.label}
            onClick={() => setSelectedPostType(postType.value)}
          />
        ))}
      </Box>

      <PostSearchFilters onSearch={onSearch} filters={postFilters} setFilters={setPostFilters} loading={loadingPostList} />
      <PostGrid
        posts={postList}
        totalCount={totalCount}
        pageNumber={postFilters.pageNumber && totalCount > 0 ? postFilters.pageNumber : defaultFilters.pageNumber}
        postsPerPage={postFilters.postsPerPage || defaultFilters.postsPerPage}
        loading={loadingPostList}
        setPostFilters={setPostFilters}
      />
    </Box>
  )
}

export default FrontPage
