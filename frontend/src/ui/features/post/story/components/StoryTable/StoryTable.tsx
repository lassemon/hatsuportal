import {
  Box,
  Button,
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
import { useAtom } from 'jotai'
import _ from 'lodash'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { yellow } from '@mui/material/colors'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import { highlightTextPart } from 'utils'
import StoryCard from 'ui/features/post/story/components/StoryCard'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import { SearchStoriesRequest } from '@hatsuportal/contracts'
import { authAtom } from 'ui/state/authAtom'
import { errorAtom } from 'ui/state/errorAtom'
import { AuthStateDTO } from 'ui/state/authAtom'
import { successAtom } from 'ui/state/successAtom'
import { localStorageColorModeAtom } from 'ui/state/localStorageColorModeAtom'
import DeleteButton from 'ui/shared/components/Buttons/DeleteButton'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { useOrientation } from 'ui/shared/hooks/useOrientation'
import { TablePaginationActions } from 'ui/shared/components/TablePaginationActions'
import { IStoryService } from 'application/interfaces'
import { STORY_DEFAULTS } from 'infrastructure/services/data/StoryService'
import { Chip } from 'ui/shared/components/Chip'
import { OrderEnum, StorySortableKeyEnum, uuid, VisibilityEnum } from '@hatsuportal/common'

const reverseOrder = (order: OrderEnum) => {
  return order === OrderEnum.Ascending ? OrderEnum.Descending : OrderEnum.Ascending
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

interface StoryTableProps {
  stories: StoryViewModel[]
  storyApiService: IStoryService
  setStoryList: (value: React.SetStateAction<StoryViewModel[]>) => void
  pageNumber: number
  storiesPerPage: number
  search?: string
  setStoryTableFilters: React.Dispatch<React.SetStateAction<SearchStoriesRequest>>
  order: OrderEnum
  orderBy: string
  onRequestSort: (event: React.MouseEvent<unknown>, property: StorySortableKeyEnum) => void
  totalCount: number
  loading: boolean
}

export const StoryTable: React.FC<StoryTableProps> = ({
  stories = [],
  storyApiService,
  setStoryList,
  pageNumber,
  storiesPerPage,
  search,
  setStoryTableFilters,
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

  // @ts-ignore
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  // @ts-ignore
  const isMedium = useMediaQuery(theme.breakpoints.down('lg'))

  useEffect(() => {
    document.body.style.overflowY = 'scroll'
    return () => {
      document.body.style.overflowY = ''
    }
  }, [])

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

  const openAll = () => {
    setAllOpen(true)
    setResetKey(uuid())
  }

  const closeAll = () => {
    setAllOpen(false)
    setResetKey(uuid())
  }

  const createSortHandler = (property: StorySortableKeyEnum) => (event: React.MouseEvent<unknown>) => {
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
              <TableCell sortDirection={orderBy === StorySortableKeyEnum.NAME ? order : false}>
                <TableSortLabel
                  active={orderBy === StorySortableKeyEnum.NAME}
                  direction={orderBy === StorySortableKeyEnum.NAME ? reverseOrder(order) : OrderEnum.Descending}
                  color="info"
                  onClick={createSortHandler(StorySortableKeyEnum.NAME)}
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
                  active={orderBy === StorySortableKeyEnum.CREATED_BY}
                  direction={orderBy === StorySortableKeyEnum.CREATED_BY ? reverseOrder(order) : 'desc'}
                  onClick={createSortHandler(StorySortableKeyEnum.CREATED_BY)}
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
            ) : stories && stories.length > 0 ? (
              stories.map((story, index) => {
                return (
                  <TableStoryRow
                    key={`${story.id}-${index}-${resetKey}`}
                    story={story}
                    search={search}
                    storyApiService={storyApiService}
                    setStoryList={setStoryList}
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
                  No stories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter sx={{ opacity: loading ? '0.5' : '1', borderTop: (theme) => `1px solid ${theme.palette.grey[300]}` }}>
            <TableRow>
              <TablePagination
                labelRowsPerPage="Stories per page"
                disabled={loading}
                rowsPerPageOptions={[2, 10, 25, 50, 75, 100, 200]}
                count={totalCount}
                colSpan={LOGGED_IN_TABLE_COLUMN_COUNT}
                rowsPerPage={storiesPerPage}
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

interface TableStoryRowProps {
  story: StoryViewModel
  search?: string
  open?: boolean
  sx?: SxProps<Theme>
  storyApiService: IStoryService
  authState: AuthStateDTO
  setStoryList: (value: React.SetStateAction<StoryViewModel[]>) => void
}

const LOGGED_IN_TABLE_COLUMN_COUNT = 11

const TableStoryRow: React.FC<TableStoryRowProps> = ({
  story,
  search,
  open: externalOpen,
  storyApiService,
  authState,
  setStoryList,
  sx = {}
}) => {
  const [localStory, setLocalStory] = useState(story)
  const [open, setOpen] = useState(externalOpen || false)
  const [loadingStory, setLoadingStory] = useState(false)
  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))
  const navigate = useNavigate()
  const [areYouSureToDeleteDialogOpen, setAreYouSureToDeleteDialogOpen] = useState<boolean>(false)
  const [colorMode] = useAtom(localStorageColorModeAtom)
  const [, setSuccess] = useAtom(React.useMemo(() => successAtom, []))

  const orientation = useOrientation()
  const isPortrait = orientation === 'portrait'
  const theme = useTheme()
  const isLarge = useMediaQuery(theme.breakpoints.down('xl'))

  const storyCardPadding = isLarge ? '5%' : '20%'

  const storyRequestControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setLocalStory(story)
  }, [story])

  useEffect(() => {
    if (externalOpen !== open) {
      setOpen(externalOpen || false)
    }
  }, [externalOpen])

  useEffect(() => {
    const getStory = async (_id: string) => {
      setLoadingStory(true)
      const controller = new AbortController()
      storyRequestControllerRef.current = controller
      try {
        const fifthEditionStory = await storyApiService.findById(_id, { signal: controller.signal })
        // this if is to prevent setting the default story as the story on the row
        if (fifthEditionStory && fifthEditionStory.id === _id) {
          setLocalStory(fifthEditionStory)
        }
        setLoadingStory(false)
      } catch {
        setLoadingStory(false)
      }
    }

    if (open) {
      getStory(localStory.id)
    }
  }, [open])

  useEffect(() => {
    return () => {
      storyRequestControllerRef?.current?.abort(`story ${story.id} row unmounted`)
    }
  }, [])

  const redirectToStory = () => {
    navigate([
      { href: '/stories', label: 'Stories' },
      { href: `/story/${localStory.id}`, label: `"${localStory.name}"` }
    ])
  }

  const onDelete = () => {
    setAreYouSureToDeleteDialogOpen(true)
  }

  const closeAreYouSureToDeleteDialog = (confirmDeleteStory?: boolean) => {
    if (confirmDeleteStory) {
      deleteStory()
    }
    setAreYouSureToDeleteDialogOpen(false)
  }

  const deleteStory = () => {
    if (authState.loggedIn && authState.user && localStory) {
      storyApiService
        .delete(localStory.id)
        .then((deletedStory) => {
          setStoryList((_storyList) => {
            return _.filter(_storyList, (_story) => _story.id !== deletedStory.id)
          })
          setSuccess({ message: `Story "${deletedStory.name}" deleted succesfully!` })
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
          dangerouslySetInnerHTML={{ __html: highlightTextPart(localStory.name, search) || localStory.name }}
        />
        <TableCell onClick={() => setOpen(!open)} sx={{ textAlign: 'center', width: '0%' }}>
          {authState.user?.id === localStory.createdById ? (
            <strong>{localStory.getCreatedByName(authState.user?.id)}</strong>
          ) : (
            <span>{localStory.createdByName}</span>
          )}
        </TableCell>
        {authState.loggedIn && (
          <TableCell onClick={() => setOpen(!open)} sx={{ textAlign: 'center', width: '0%' }}>
            <Chip
              label={localStory.visibility_label}
              sx={{ fontWeight: 'bold' }}
              color={
                localStory.visibility === VisibilityEnum.Public
                  ? 'success'
                  : localStory.visibility === VisibilityEnum.LoggedIn
                  ? 'warning'
                  : localStory.visibility === VisibilityEnum.Private
                  ? 'error'
                  : 'default'
              }
            />
          </TableCell>
        )}
        <TableCell sx={{ width: '0%', textAlign: authState.loggedIn ? 'center' : 'end' }}>
          <Button variant="contained" onClick={redirectToStory}>
            Show
          </Button>
        </TableCell>
        {authState.loggedIn && (
          <TableCell
            sx={{ width: '0%', textAlign: 'end', maxWidth: '3%' }}
            onClick={
              localStory?.id === STORY_DEFAULTS.NEW_STORY_ID || localStory.createdById !== authState.user?.id
                ? () => setOpen(!open)
                : undefined
            }
          >
            <Tooltip
              title={localStory?.id === STORY_DEFAULTS.NEW_STORY_ID || localStory.createdById !== authState.user?.id ? '' : 'Delete story'}
              placement="top-end"
            >
              <div>
                <DeleteButton
                  onClick={onDelete}
                  Icon={DeleteForeverIcon}
                  disabled={localStory?.id === STORY_DEFAULTS.NEW_STORY_ID || localStory.createdById !== authState.user?.id}
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
                  Are you sure you want to delete <strong>{localStory?.name}</strong>
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'space-between', alignStories: 'stretch' }}>
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
                flexDirection: 'column',
                margin: '2em 1em',
                maxWidth: '100%',
                paddingRight: isPortrait ? storyCardPadding : '',
                '& .stats-container': {
                  margin: 0
                }
              }}
            >
              {loadingStory ? (
                <Skeleton variant="rounded" width="100%" height={60} animation="wave" />
              ) : (
                <StoryCard story={localStory} loadingStory={loadingStory} />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default React.memo(StoryTable)
