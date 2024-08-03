import { StoryTable, StoryTableFilters } from 'ui/features/post/story/components/StoryTable'
import StoryGrid from 'ui/features/post/story/components/StoryGrid'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import _ from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppsIcon from '@mui/icons-material/Apps'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { Box, IconButton, Tooltip } from '@mui/material'
import { unstable_batchedUpdates } from 'react-dom'
import { SearchStoriesRequest } from '@hatsuportal/contracts'
import { authAtom } from 'ui/state/authAtom'
import { errorAtom } from 'ui/state/errorAtom'
import { useDataServiceContext } from 'infrastructure/hooks/useDataServiceContext'
import { castToEnum, OrderEnum, StorySortableKeyEnum, validateAndCastEnum } from '@hatsuportal/common'

export const defaultFilters = {
  storiesPerPage: 50,
  pageNumber: 0,
  orderBy: StorySortableKeyEnum.NAME,
  order: OrderEnum.Ascending
}

enum ListViewMode {
  TABLE = 'table',
  GRID = 'grid'
}

const localStorageFiltersAtom = atomWithStorage<SearchStoriesRequest>(
  'localFiltersAtom',
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

const localStorageViewModeAtom = atomWithStorage<`${ListViewMode}`>(
  'localStoriesViewModeAtom',
  ListViewMode.TABLE,
  {
    getItem: (key, initialValue) => {
      const storedViewMode = castToEnum(localStorage.getItem(key), ListViewMode, ListViewMode.TABLE)
      return storedViewMode || initialValue
    },
    setItem: (key, newValue) => {
      if (newValue === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, newValue)
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key)
    }
  },
  { getOnInit: true }
)

const getFiltersFromUrl = (searchParams: URLSearchParams): Partial<SearchStoriesRequest> => {
  return _({
    storiesPerPage: parseInt(searchParams.get('storiesPerPage') || '') || undefined,
    pageNumber: parseInt(searchParams.get('pageNumber') || '') || undefined,
    onlyMyStories: searchParams.get('onlyMyStories') ? searchParams.get('onlyMyStories') === 'true' : undefined,
    search: searchParams.get('search') || undefined,
    order: (searchParams.get('order') as OrderEnum) || undefined,
    orderBy: (searchParams.get('orderBy') as StorySortableKeyEnum) || undefined,
    visibility: !_.isEmpty(searchParams.getAll('visibility'))
      ? (searchParams.getAll('visibility') as SearchStoriesRequest['visibility'])
      : undefined,
    hasImage: searchParams.get('hasImage') ? searchParams.get('hasImage') === 'true' : undefined
  })
    .omitBy(_.isUndefined)
    .value()
}

const constructFilters = (urlFilters: Partial<SearchStoriesRequest>, localStorageFilters: SearchStoriesRequest): SearchStoriesRequest => {
  if (!_.isEmpty(urlFilters)) {
    return {
      storiesPerPage: urlFilters.storiesPerPage || defaultFilters.storiesPerPage,
      pageNumber: urlFilters.pageNumber || defaultFilters.pageNumber,
      onlyMyStories: urlFilters.onlyMyStories || false,
      search: urlFilters.search || undefined,
      order: (urlFilters.order as OrderEnum) || defaultFilters.order,
      orderBy: urlFilters.orderBy || defaultFilters.orderBy,
      visibility: (urlFilters.visibility as SearchStoriesRequest['visibility']) || [],
      hasImage: urlFilters.hasImage !== undefined ? urlFilters.hasImage : null
    }
  } else {
    return localStorageFilters
  }
}

const convertFiltersToUrlSearchParams = (storyTableFilters: SearchStoriesRequest, loggedIn: boolean) => {
  return {
    pageNumber: String(storyTableFilters.pageNumber || defaultFilters.pageNumber),
    storiesPerPage: String(storyTableFilters.storiesPerPage || defaultFilters.storiesPerPage),
    order: String(storyTableFilters.order || defaultFilters.order),
    orderBy: String(storyTableFilters.orderBy || defaultFilters.orderBy),
    ...(loggedIn ? { onlyMyStories: String(storyTableFilters.onlyMyStories || 'false') } : {}),
    visibility: storyTableFilters.visibility || [],
    ...(storyTableFilters.search && storyTableFilters.search ? { search: storyTableFilters.search } : { search: '' }),
    ...(storyTableFilters.hasImage !== null ? { hasImage: String(storyTableFilters.hasImage) } : {})
  }
}

interface ListViewSelectionProps {
  onClick: (mode: `${ListViewMode}`) => void
  listViewMode: `${ListViewMode}`
  disabled?: boolean
}

const ListViewSelection: React.FC<ListViewSelectionProps> = ({ onClick, listViewMode, disabled }) => {
  const internalOnClick = (mode: `${ListViewMode}`) => () => {
    onClick(mode)
  }
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Tooltip title="Grid View" disableInteractive placement="top-end">
        <span>
          <IconButton
            sx={{
              borderRadius: 0,
              background: (theme) => (listViewMode === ListViewMode.GRID ? theme.palette.background.paper : theme.palette.grey[700]),
              color: (theme) => (listViewMode === ListViewMode.GRID ? theme.palette.action.active : theme.palette.grey[500]),
              '&:hover': {
                background: (theme) => theme.palette.background.paper,
                color: (theme) => theme.palette.primary.light
              }
            }}
            size="large"
            onClick={internalOnClick('grid')}
            disabled={disabled}
          >
            <AppsIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Table View" disableInteractive placement="top-end">
        <span>
          <IconButton
            sx={{
              borderRadius: 0,
              background: (theme) => (listViewMode === ListViewMode.TABLE ? theme.palette.background.paper : theme.palette.grey[700]),
              color: (theme) => (listViewMode === ListViewMode.TABLE ? theme.palette.action.active : theme.palette.grey[500]),
              '&:hover': {
                background: (theme) => theme.palette.background.paper,
                color: (theme) => theme.palette.primary.light
              }
            }}
            size="large"
            onClick={internalOnClick('table')}
            disabled={disabled}
            disableRipple
          >
            <TableRowsIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

const AllStoriesPage: React.FC = () => {
  const dataServiceContext = useDataServiceContext()

  const fetchStoriesControllerRef = useRef<AbortController | null>(null)

  const [localStorageFilters, setLocalStorageFilters] = useAtom(localStorageFiltersAtom)
  const [localStorageViewMode, setLocalStorageViewMode] = useAtom(localStorageViewModeAtom)

  const [storyList, setStoryList] = useState<StoryViewModel[]>([])
  const [listViewMode, setListViewMode] = useState<`${ListViewMode}`>(localStorageViewMode)
  const [loadingStoryList, setLoadingStoryList] = useState(false)
  let [searchParams, setSearchParams] = useSearchParams()

  const urlFilters = getFiltersFromUrl(searchParams)

  const [storyTableFilters, setStoryTableFilters] = useState<SearchStoriesRequest>(constructFilters(urlFilters, localStorageFilters))
  const [totalCount, setTotalCount] = React.useState(0)
  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))
  const [authState] = useAtom(authAtom)

  const fetchAndSetStories = async (filters: SearchStoriesRequest) => {
    try {
      setLoadingStoryList(true)
      const controller = new AbortController()
      fetchStoriesControllerRef.current = controller
      const storyList = await dataServiceContext.storyService.search(filters, { signal: controller.signal }).finally(() => {
        setLoadingStoryList(false)
      })
      setStoryList(storyList.stories)
      setTotalCount(storyList.totalCount)
    } catch (error: any) {
      if (!(error instanceof DOMException)) {
        setError(error)
      }
    }
  }

  useEffect(() => {
    setSearchParams(convertFiltersToUrlSearchParams(storyTableFilters, authState.loggedIn))
    setLocalStorageFilters(storyTableFilters)
  }, [storyTableFilters])

  useEffect(() => {
    setStoryTableFilters({ ...storyTableFilters, visibility: authState.loggedIn ? storyTableFilters.visibility : [] })
    fetchAndSetStories({ ...defaultFilters, ...storyTableFilters })
  }, [
    authState.loggedIn,
    storyTableFilters.storiesPerPage,
    storyTableFilters.pageNumber,
    storyTableFilters.onlyMyStories,
    storyTableFilters.order,
    storyTableFilters.orderBy
  ])

  useEffect(() => {
    return () => {
      fetchStoriesControllerRef?.current?.abort()
    }
  }, [])

  const onSearch = (filters: Omit<SearchStoriesRequest, 'order' | 'orderBy'>) => {
    const allFilters = { ...defaultFilters, ...filters, order: storyTableFilters.order, orderBy: storyTableFilters.orderBy }
    setStoryTableFilters(allFilters)
    fetchAndSetStories(allFilters)
  }

  const onChangeMode = (mode: `${ListViewMode}`) => {
    unstable_batchedUpdates(() => {
      setListViewMode(mode)
      setLocalStorageViewMode(mode)
    })
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: `${StorySortableKeyEnum}`) => {
    const isAsc = storyTableFilters.orderBy === property && storyTableFilters.order === OrderEnum.Ascending
    setStoryTableFilters({
      ...defaultFilters,
      ...storyTableFilters,
      order: isAsc ? OrderEnum.Descending : OrderEnum.Ascending,
      orderBy: property
    })
  }

  return (
    <Box sx={{ margin: '2em' }}>
      <StoryTableFilters onSearch={onSearch} filters={storyTableFilters} setFilters={setStoryTableFilters} loading={loadingStoryList} />
      <ListViewSelection onClick={onChangeMode} listViewMode={listViewMode} disabled={loadingStoryList} />
      {listViewMode === ListViewMode.TABLE ? (
        <StoryTable
          storyApiService={dataServiceContext.storyService}
          stories={storyList}
          setStoryList={setStoryList}
          pageNumber={storyTableFilters.pageNumber && totalCount > 0 ? storyTableFilters.pageNumber : defaultFilters.pageNumber}
          storiesPerPage={storyTableFilters.storiesPerPage || defaultFilters.storiesPerPage}
          search={storyTableFilters.search}
          setStoryTableFilters={setStoryTableFilters}
          onRequestSort={handleRequestSort}
          order={validateAndCastEnum(storyTableFilters.order, OrderEnum)}
          orderBy={storyTableFilters.orderBy}
          totalCount={totalCount}
          loading={loadingStoryList}
        />
      ) : (
        <StoryGrid
          stories={storyList}
          totalCount={totalCount}
          pageNumber={storyTableFilters.pageNumber && totalCount > 0 ? storyTableFilters.pageNumber : defaultFilters.pageNumber}
          storiesPerPage={storyTableFilters.storiesPerPage || defaultFilters.storiesPerPage}
          loading={loadingStoryList}
          setStoryTableFilters={setStoryTableFilters}
        />
      )}
    </Box>
  )
}

export default AllStoriesPage
