import { SearchItemsRequestDTO } from '@hatsuportal/application'
import { castToEnum } from '@hatsuportal/common'
import { Item, ItemSortableKey, ItemSortFields, Order } from '@hatsuportal/domain'
import ItemTable from 'components/ItemTable'
import ItemTableFilters from 'components/ItemTable/ItemTableFilters'
import PageHeader from 'components/PageHeader'
import { authAtom, errorAtom } from 'infrastructure/dataAccess/atoms'
import ImageApiService from 'infrastructure/repositories/ImageApiService'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import _ from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppsIcon from '@mui/icons-material/Apps'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { Box, IconButton, Tooltip } from '@mui/material'
import { unstable_batchedUpdates } from 'react-dom'
import ItemGrid from 'components/ItemGrid'
import ItemApiService from 'services/ItemApiService'

export const defaultFilters = {
  itemsPerPage: 50,
  pageNumber: 0,
  orderBy: ItemSortableKey.NAME,
  order: Order.Ascending
}

enum ListViewMode {
  TABLE = 'table',
  GRID = 'grid'
}

const itemApiService = new ItemApiService()
const imageApiService = new ImageApiService()

const localStorageFiltersAtom = atomWithStorage<SearchItemsRequestDTO>(
  'localFiltersAtom',
  defaultFilters,
  {
    getItem: (key, initialValue) => {
      const storedItem = JSON.parse(localStorage.getItem(key) || 'null')
      return storedItem || initialValue
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
  'localItemsViewModeAtom',
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

const getFiltersFromUrl = (searchParams: URLSearchParams): Partial<SearchItemsRequestDTO> => {
  return _({
    itemsPerPage: parseInt(searchParams.get('itemsPerPage') || '') || undefined,
    pageNumber: parseInt(searchParams.get('pageNumber') || '') || undefined,
    onlyMyItems: searchParams.get('onlyMyItems') ? searchParams.get('onlyMyItems') === 'true' : undefined,
    search: searchParams.get('search') || undefined,
    order: (searchParams.get('order') as Order) || undefined,
    orderBy: (searchParams.get('orderBy') as ItemSortableKey) || undefined,
    visibility: !_.isEmpty(searchParams.getAll('visibility'))
      ? (searchParams.getAll('visibility') as SearchItemsRequestDTO['visibility'])
      : undefined,
    hasImage: searchParams.get('hasImage') ? searchParams.get('hasImage') === 'true' : undefined
  })
    .omitBy(_.isUndefined)
    .value()
}

const constructFilters = (
  urlFilters: Partial<SearchItemsRequestDTO>,
  localStorageFilters: SearchItemsRequestDTO
): SearchItemsRequestDTO => {
  if (!_.isEmpty(urlFilters)) {
    return {
      itemsPerPage: urlFilters.itemsPerPage || defaultFilters.itemsPerPage,
      pageNumber: urlFilters.pageNumber || defaultFilters.pageNumber,
      onlyMyItems: urlFilters.onlyMyItems || false,
      search: urlFilters.search || undefined,
      order: (urlFilters.order as Order) || defaultFilters.order,
      orderBy: urlFilters.orderBy || defaultFilters.orderBy,
      visibility: (urlFilters.visibility as SearchItemsRequestDTO['visibility']) || [],
      hasImage: urlFilters.hasImage !== undefined ? urlFilters.hasImage : null
    }
  } else {
    return localStorageFilters
  }
}

const convertFiltersToUrlSearchParams = (itemTableFilters: SearchItemsRequestDTO, loggedIn: boolean) => {
  return {
    pageNumber: String(itemTableFilters.pageNumber || defaultFilters.pageNumber),
    itemsPerPage: String(itemTableFilters.itemsPerPage || defaultFilters.itemsPerPage),
    order: String(itemTableFilters.order || defaultFilters.order),
    orderBy: String(itemTableFilters.orderBy || defaultFilters.orderBy),
    ...(loggedIn ? { onlyMyItems: String(itemTableFilters.onlyMyItems || 'false') } : {}),
    visibility: itemTableFilters.visibility || [],
    ...(itemTableFilters.search && itemTableFilters.search ? { search: itemTableFilters.search } : { search: '' }),
    ...(itemTableFilters.hasImage !== null ? { hasImage: String(itemTableFilters.hasImage) } : {})
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
      <Tooltip title="Table View" disableInteractive placement="top-end">
        <span>
          <IconButton
            sx={{ borderRadius: 0, background: (theme) => theme.palette.background.paper }}
            color={listViewMode === ListViewMode.TABLE ? 'default' : 'primary'}
            size="large"
            onClick={internalOnClick('table')}
            disabled={disabled}
          >
            <TableRowsIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Grid View" disableInteractive placement="top-end">
        <span>
          <IconButton
            sx={{ borderRadius: 0, background: (theme) => theme.palette.background.paper }}
            color={listViewMode === ListViewMode.GRID ? 'default' : 'primary'}
            size="large"
            onClick={internalOnClick('grid')}
            disabled={disabled}
          >
            <AppsIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

const ItemsPage: React.FC = () => {
  const navigate = useNavigate()

  const fetchItemsControllerRef = useRef<AbortController | null>(null)

  const [localStorageFilters, setLocalStorageFilters] = useAtom(localStorageFiltersAtom)
  const [localStorageViewMode, setLocalStorageViewMode] = useAtom(localStorageViewModeAtom)

  const [itemList, setItemList] = useState<Item[]>([])
  const [listViewMode, setListViewMode] = useState<`${ListViewMode}`>(localStorageViewMode)
  const [loadingItemList, setLoadingItemList] = useState(false)
  let [searchParams, setSearchParams] = useSearchParams()

  const urlFilters = getFiltersFromUrl(searchParams)

  const [itemTableFilters, setItemTableFilters] = useState<SearchItemsRequestDTO>(constructFilters(urlFilters, localStorageFilters))
  const [totalCount, setTotalCount] = React.useState(0)
  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))
  const [authState] = useAtom(authAtom)

  const fetchAndSetItems = async (filters: SearchItemsRequestDTO) => {
    try {
      setLoadingItemList(true)
      const controller = new AbortController()
      fetchItemsControllerRef.current = controller
      const itemSearchResponse = await itemApiService.search(filters, { signal: controller.signal }).finally(() => {
        setLoadingItemList(false)
      })
      setItemList(
        itemSearchResponse.items
          .concat(itemSearchResponse.items)
          .concat(itemSearchResponse.items)
          .concat(itemSearchResponse.items)
          .concat(itemSearchResponse.items)
          .map((item) => new Item(item))
      )
      setTotalCount(itemSearchResponse.totalCount)
    } catch (error: any) {
      if (!(error instanceof DOMException)) {
        setError(error)
      }
    }
  }

  useEffect(() => {
    setSearchParams(convertFiltersToUrlSearchParams(itemTableFilters, authState.loggedIn))
    setLocalStorageFilters(itemTableFilters)
  }, [itemTableFilters])

  useEffect(() => {
    fetchAndSetItems({ ...defaultFilters, ...itemTableFilters })
  }, [
    authState.loggedIn,
    itemTableFilters.itemsPerPage,
    itemTableFilters.pageNumber,
    itemTableFilters.onlyMyItems,
    itemTableFilters.order,
    itemTableFilters.orderBy
  ])

  useEffect(() => {
    return () => {
      fetchItemsControllerRef?.current?.abort()
    }
  }, [])

  const onSearch = (filters: Omit<SearchItemsRequestDTO, 'order' | 'orderBy'>) => {
    const allFilters = { ...defaultFilters, ...filters, order: itemTableFilters.order, orderBy: itemTableFilters.orderBy }
    setItemTableFilters(allFilters)
    fetchAndSetItems(allFilters)
  }

  const onChangeMode = (mode: `${ListViewMode}`) => {
    unstable_batchedUpdates(() => {
      setListViewMode(mode)
      setLocalStorageViewMode(mode)
    })
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: (typeof ItemSortFields)[number]) => {
    const isAsc = itemTableFilters.orderBy === property && itemTableFilters.order === Order.Ascending
    setItemTableFilters({ ...defaultFilters, ...itemTableFilters, order: isAsc ? Order.Descending : Order.Ascending, orderBy: property })
  }

  const goToItem = (itemId?: string) => {
    if (itemId) {
      navigate(`/card/item/${itemId}`)
    }
  }

  return (
    <Box sx={{ margin: '2em' }}>
      <PageHeader>Items</PageHeader>
      <ItemTableFilters onSearch={onSearch} filters={itemTableFilters} setFilters={setItemTableFilters} loading={loadingItemList} />
      <ListViewSelection onClick={onChangeMode} listViewMode={listViewMode} disabled={loadingItemList} />
      {listViewMode === ListViewMode.TABLE ? (
        <ItemTable
          itemApiService={itemApiService}
          items={itemList}
          imageApiService={imageApiService}
          setItemList={setItemList}
          pageNumber={itemTableFilters.pageNumber && totalCount > 0 ? itemTableFilters.pageNumber : defaultFilters.pageNumber}
          itemsPerPage={itemTableFilters.itemsPerPage || defaultFilters.itemsPerPage}
          search={itemTableFilters.search}
          setItemTableFilters={setItemTableFilters}
          onRequestSort={handleRequestSort}
          order={itemTableFilters.order}
          orderBy={itemTableFilters.orderBy}
          totalCount={totalCount}
          loading={loadingItemList}
        />
      ) : (
        <ItemGrid
          items={itemList}
          totalCount={totalCount}
          pageNumber={itemTableFilters.pageNumber && totalCount > 0 ? itemTableFilters.pageNumber : defaultFilters.pageNumber}
          itemsPerPage={itemTableFilters.itemsPerPage || defaultFilters.itemsPerPage}
          loading={loadingItemList}
          setItemTableFilters={setItemTableFilters}
          goToItem={goToItem}
        />
      )}
    </Box>
  )
}

export default ItemsPage
