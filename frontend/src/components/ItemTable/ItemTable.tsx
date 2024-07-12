import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Theme,
  Tooltip,
  Typography,
  darken,
  lighten,
  tableCellClasses,
  useMediaQuery,
  useTheme
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { useOrientation } from 'utils/hooks'
import { useNavigate } from 'react-router-dom'
import { SearchItemsRequestDTO } from '@hatsuportal/application'
import { useAtom } from 'jotai'
import { AuthState, authAtom, errorAtom } from 'infrastructure/dataAccess/atoms'
import _ from 'lodash'
import useImage from 'hooks/useImage'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Item, ItemSortableKey, Order, Visibility } from '@hatsuportal/domain'
import { yellow } from '@mui/material/colors'

import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import { uuid } from '@hatsuportal/common'
import { ItemSortFields } from '@hatsuportal/domain'
import { highlightTextPart } from 'utils/utils'
import { TablePaginationActions } from './TablePaginationActions'
import DeleteButton from 'components/DeleteButton'
import { localStorageColorModeAtom } from 'components/Theme/Theme'
import { ItemApiServiceInterface } from 'infrastructure/repositories/ItemApiServiceInterface'
import { ImageApiServiceInterface } from 'infrastructure/repositories/ImageApiServiceInterface'

const reverseOrder = (order: `${Order}`) => {
  return order === Order.Ascending ? Order.Descending : Order.Ascending
}

const ExpandCollapseTableCell: React.FC<{ closeAll: () => void; openAll: () => void }> = ({ closeAll, openAll }) => {
  return (
    <TableCell sx={{ width: '0%', textAlign: 'right', maxWidth: '3%' }}>
      <Tooltip title="Close all" placement="top-end">
        <IconButton onClick={closeAll}>
          <CloseFullscreenIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Open all" placement="top-end">
        <IconButton onClick={openAll}>
          <OpenInFullIcon />
        </IconButton>
      </Tooltip>
    </TableCell>
  )
}

interface ItemTableProps {
  items: Item[]
  itemApiService: ItemApiServiceInterface
  imageApiService: ImageApiServiceInterface
  setItemList: (value: React.SetStateAction<Item[]>) => void
  pageNumber: number
  itemsPerPage: number
  search?: string
  setItemTableFilters: React.Dispatch<React.SetStateAction<SearchItemsRequestDTO>>
  order: `${Order}`
  orderBy: string
  onRequestSort: (event: React.MouseEvent<unknown>, property: (typeof ItemSortFields)[number]) => void
  totalCount: number
  loading: boolean
}

export const ItemTable: React.FC<ItemTableProps> = ({
  items = [],
  itemApiService,
  imageApiService,
  setItemList,
  pageNumber,
  itemsPerPage,
  search,
  setItemTableFilters,
  order,
  orderBy,
  onRequestSort,
  totalCount,
  loading
}) => {
  const [authState] = useAtom(authAtom)
  const theme = useTheme()
  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'
  const [allOpen, setAllOpen] = useState(false)
  const [resetKey, setResetKey] = useState('')

  const [colorMode] = useAtom(localStorageColorModeAtom)

  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const isMedium = useMediaQuery(theme.breakpoints.down('lg'))

  useEffect(() => {
    document.body.style.overflowY = 'scroll'
    return () => {
      document.body.style.overflowY = ''
    }
  }, [])

  const handleChangePage = (event: unknown, newPage: number) => {
    setItemTableFilters((_itemTableFilters) => {
      return {
        ..._itemTableFilters,
        pageNumber: newPage
      }
    })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemTableFilters((_itemTableFilters) => {
      return {
        ..._itemTableFilters,
        itemsPerPage: +event.target.value,
        pageNumber: 0
      }
    })
  }

  const openAll = () => {
    setAllOpen(true)
    setResetKey(uuid())
  }

  const closeAll = () => {
    setAllOpen(false)
    setResetKey(uuid())
  }

  const createSortHandler = (property: (typeof ItemSortFields)[number]) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer
        sx={{
          '& .highlight': {
            backgroundColor: yellow['700'],
            color: theme.palette.getContrastText(yellow['700'])
          },
          boxShadow: '0px 2px 0px -1px rgba(0,0,0,0.4)'
        }}
      >
        <Table
          stickyHeader
          size={totalCount > 20 || isPortrait ? 'small' : 'medium'}
          sx={{
            '& .MuiTableCell-root': {
              padding: '8px 8px'
            },
            [`& .${tableCellClasses.root}`]: {
              borderBottom: 'none'
            }
          }}
        >
          <TableHead
            sx={{
              '& th': {
                textTransform: 'capitalize',
                fontWeight: 'bold',
                fontSize: '1.3em',
                color: loading ? theme.palette.grey[400] : theme.palette.secondary.main,
                background: (theme) => theme.palette.background.paper,
                whiteSpace: 'nowrap',
                borderBottom: 'unset'
              }
            }}
          >
            <TableRow>
              <TableCell />
              <TableCell sortDirection={orderBy === ItemSortableKey.NAME ? order : false}>
                <TableSortLabel
                  active={orderBy === ItemSortableKey.NAME}
                  direction={orderBy === ItemSortableKey.NAME ? reverseOrder(order) : 'desc'}
                  color="info"
                  onClick={createSortHandler(ItemSortableKey.NAME)}
                  sx={{
                    '&.Mui-active': {
                      color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
                    }
                  }}
                >
                  name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <TableSortLabel
                  active={orderBy === ItemSortableKey.CREATED_BY}
                  direction={orderBy === ItemSortableKey.CREATED_BY ? reverseOrder(order) : 'desc'}
                  onClick={createSortHandler(ItemSortableKey.CREATED_BY)}
                >
                  created by
                </TableSortLabel>
              </TableCell>
              {authState.loggedIn && <TableCell sx={{ textAlign: 'center' }}>visibility</TableCell>}
              {!authState.loggedIn ? (
                <ExpandCollapseTableCell openAll={openAll} closeAll={closeAll} />
              ) : (
                <TableCell sx={{ width: '1em' }} />
              )}
              {authState.loggedIn && <ExpandCollapseTableCell openAll={openAll} closeAll={closeAll} />}
            </TableRow>
          </TableHead>
          <TableBody sx={{ opacity: loading ? '0.5' : '1' }}>
            {loading ? (
              <TableRow>
                <TableCell
                  sx={{ width: '0%', minWidth: '2em' }}
                  colSpan={authState.loggedIn ? LOGGED_IN_TABLE_COLUMN_COUNT - 6 : LOGGED_IN_TABLE_COLUMN_COUNT - 7}
                >
                  {Array.from(Array(4).keys()).map((index) => {
                    return (
                      <Skeleton
                        key={index}
                        variant="rounded"
                        width="100%"
                        height={40}
                        animation="wave"
                        sx={{ margin: '0 0 0.5em 0', backgroundColor: 'rgba(0, 0, 0, 0.21)' }}
                      />
                    )
                  })}
                </TableCell>
              </TableRow>
            ) : items && items.length > 0 ? (
              items.map((item, index) => {
                return (
                  <TableItemRow
                    key={`${item.id}-${index}-${resetKey}`}
                    item={item}
                    search={search}
                    itemApiService={itemApiService}
                    imageApiService={imageApiService}
                    setItemList={setItemList}
                    authState={authState}
                    open={allOpen}
                    sx={{
                      ...(index % 2 === 0
                        ? {
                            // even rows
                            background: (theme) =>
                              colorMode === 'dark'
                                ? lighten(theme.palette.background.default, 0.2)
                                : lighten(theme.palette.background.default, 0.8)
                          }
                        : {
                            background: (theme) =>
                              colorMode === 'dark'
                                ? lighten(theme.palette.background.default, 0.1)
                                : lighten(theme.palette.background.default, 0.7)
                          }),
                      '&:hover': {
                        background: (theme) =>
                          colorMode === 'dark'
                            ? lighten(theme.palette.background.default, 0.3)
                            : lighten(theme.palette.background.default, 0.5),
                        color: (theme) => theme.palette.getContrastText(darken(theme.palette.background.default, 0.2))
                      },
                      '&& > *': {
                        color: (theme) =>
                          colorMode === 'dark'
                            ? theme.palette.getContrastText(lighten(theme.palette.background.default, 0.2))
                            : theme.palette.getContrastText(lighten(theme.palette.background.default, 0.8))
                      }
                    }}
                  />
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={authState.loggedIn ? LOGGED_IN_TABLE_COLUMN_COUNT : LOGGED_IN_TABLE_COLUMN_COUNT - 1}
                  sx={{ padding: '10em', textAlign: 'center' }}
                >
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter sx={{ opacity: loading ? '0.5' : '1', borderTop: (theme) => `1px solid ${theme.palette.grey[300]}` }}>
            <TableRow>
              <TablePagination
                labelRowsPerPage="Items per page"
                disabled={loading}
                rowsPerPageOptions={[2, 10, 25, 50, 75, 100, 200]}
                count={totalCount}
                colSpan={LOGGED_IN_TABLE_COLUMN_COUNT}
                rowsPerPage={itemsPerPage}
                page={pageNumber}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                sx={{
                  color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  )
}

interface TableItemRowProps {
  item: Item
  search?: string
  open?: boolean
  sx?: SxProps<Theme>
  itemApiService: ItemApiServiceInterface
  imageApiService: ImageApiServiceInterface
  authState: AuthState
  setItemList: (value: React.SetStateAction<Item[]>) => void
}

const LOGGED_IN_TABLE_COLUMN_COUNT = 11

const TableItemRow: React.FC<TableItemRowProps> = ({
  item,
  search,
  open: externalOpen,
  itemApiService,
  imageApiService,
  authState,
  setItemList,
  sx = {}
}) => {
  const [localItem, setLocalItem] = useState(item)
  const [open, setOpen] = useState(externalOpen || false)
  const [loadingItem, setLoadingItem] = useState(false)
  const [imageId, setImageId] = useState<string | null>(null)
  const [{ image, loading: loadingImage }] = useImage(imageApiService, imageId)
  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))
  const navigate = useNavigate()
  const [areYouSureToDeleteDialogOpen, setAreYouSureToDeleteDialogOpen] = useState<boolean>(false)
  const [colorMode] = useAtom(localStorageColorModeAtom)

  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'
  const theme = useTheme()
  const isLarge = useMediaQuery(theme.breakpoints.down('xl'))

  const itemCardPadding = isLarge ? '5%' : '20%'

  const itemRequestControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setLocalItem(item)
  }, [item])

  useEffect(() => {
    setImageId(localItem.imageId)
  }, [localItem])

  useEffect(() => {
    if (externalOpen !== open) {
      setOpen(externalOpen || false)
    }
  }, [externalOpen])

  useEffect(() => {
    const getItem = async (_id: string) => {
      setLoadingItem(true)
      const controller = new AbortController()
      itemRequestControllerRef.current = controller
      try {
        const fifthEditionItem = await itemApiService.findById(_id, { signal: controller.signal })
        // this if is to prevent setting the default item as the item on the row
        if (fifthEditionItem.id === _id) {
          setLocalItem(new Item(fifthEditionItem))
        }
        setLoadingItem(false)
      } catch {
        setLoadingItem(false)
      }
    }

    if (open) {
      getItem(localItem.id)
    }
  }, [open])

  useEffect(() => {
    return () => {
      itemRequestControllerRef?.current?.abort(`item ${item.id} row unmounted`)
    }
  }, [])

  const redirectToItem = () => {
    navigate(`/item/${localItem.id}`)
  }

  const onDelete = () => {
    setAreYouSureToDeleteDialogOpen(true)
  }

  const closeAreYouSureToDeleteDialog = (confirmDeleteItem?: boolean) => {
    if (confirmDeleteItem) {
      deleteItem()
    }
    setAreYouSureToDeleteDialogOpen(false)
  }

  const deleteItem = () => {
    if (authState.loggedIn && authState.user && localItem) {
      itemApiService
        .delete(localItem.id)
        .then((deletedItem) => {
          setItemList((_itemList) => {
            return _.filter(_itemList, (_item) => _item.id !== deletedItem.id)
          })
        })
        .catch((error) => {
          setError(error)
        })
    }
  }

  return (
    <React.Fragment>
      <TableRow
        className="row"
        sx={{
          ...sx,
          ...{
            '& > *': {
              width: '4%',
              whiteSpace: 'nowrap'
            },
            cursor: 'pointer'
          }
        }}
      >
        <TableCell onClick={() => setOpen(!open)} sx={{ width: '0%', maxWidth: '2em' }}>
          <IconButton
            size="small"
            sx={{
              color: (theme) =>
                colorMode === 'dark'
                  ? theme.palette.getContrastText(theme.palette.background.default)
                  : theme.palette.getContrastText(lighten(theme.palette.background.default, 0.8))
            }}
          >
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          sx={{ '&&&': { whiteSpace: 'normal' }, width: '100%', minWidth: '6em', textTransform: 'capitalize' }}
          onClick={() => setOpen(!open)}
          dangerouslySetInnerHTML={{ __html: highlightTextPart(localItem.name, search) || localItem.name }}
        />
        <TableCell onClick={() => setOpen(!open)} sx={{ textAlign: 'center', width: '0%' }}>
          {authState.user?.id === localItem.createdBy ? (
            <strong>{localItem.getCreatedByUserName(authState.user?.id)}</strong>
          ) : (
            <span>{localItem.createdByUserName}</span>
          )}
        </TableCell>
        {authState.loggedIn && (
          <TableCell onClick={() => setOpen(!open)} sx={{ textAlign: 'center', width: '0%' }}>
            <Chip
              label={localItem.visibility_label}
              sx={{ fontWeight: 'bold' }}
              color={
                localItem.visibility === Visibility.Public
                  ? 'success'
                  : localItem.visibility === Visibility.LoggedIn
                  ? 'warning'
                  : localItem.visibility === Visibility.Private
                  ? 'error'
                  : 'default'
              }
            />
          </TableCell>
        )}
        <TableCell sx={{ width: '0%', textAlign: authState.loggedIn ? 'center' : 'end' }}>
          <Button variant="contained" onClick={redirectToItem}>
            Show
          </Button>
        </TableCell>
        {authState.loggedIn && (
          <TableCell
            sx={{ width: '0%', textAlign: 'end', maxWidth: '3%' }}
            onClick={localItem?.id === 'newItem' || localItem.createdBy !== authState.user?.id ? () => setOpen(!open) : undefined}
          >
            <Tooltip
              title={localItem?.id === 'newItem' || localItem.createdBy !== authState.user?.id ? '' : 'Delete item'}
              placement="top-end"
            >
              <div>
                <DeleteButton
                  onClick={onDelete}
                  Icon={DeleteForeverIcon}
                  disabled={localItem?.id === 'newItem' || localItem.createdBy !== authState.user?.id}
                />
              </div>
            </Tooltip>
            <Dialog
              open={areYouSureToDeleteDialogOpen}
              onClose={() => closeAreYouSureToDeleteDialog()}
              PaperProps={{ sx: { padding: '0.5em' } }}
            >
              <DialogTitle id={`are-you-sure-to-delete`} sx={{ fontWeight: 'bold' }}>{`Are you sure`}</DialogTitle>
              <DialogContent>
                <Typography variant="body2" paragraph={false}>
                  Are you sure you want to delete <strong>{localItem?.name}</strong>
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'space-between', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginRight: '6em' }}>
                  <Button variant="outlined" color="secondary" onClick={() => closeAreYouSureToDeleteDialog()}>
                    Cancel
                  </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.5em' }}>
                  <Button variant="outlined" color="error" onClick={() => closeAreYouSureToDeleteDialog(true)}>
                    Yes, delete
                  </Button>
                </div>
              </DialogActions>
            </Dialog>
          </TableCell>
        )}
      </TableRow>
      <TableRow className="collapsible">
        <TableCell style={{ padding: 0 }} colSpan={authState.loggedIn ? LOGGED_IN_TABLE_COLUMN_COUNT : LOGGED_IN_TABLE_COLUMN_COUNT - 1}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                display: 'flex',
                margin: 3,
                maxWidth: '90%',
                paddingRight: isPortrait ? '' : itemCardPadding,
                '& .stats-container': {
                  margin: 0
                }
              }}
            >
              {loadingItem ? (
                <Skeleton variant="rounded" width="100%" height={60} animation="wave" />
              ) : (
                <>
                  <p>{localItem.id}</p>
                  <p>{image?.id}</p>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default React.memo(ItemTable)
