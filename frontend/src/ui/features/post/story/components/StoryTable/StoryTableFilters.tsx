import { LoadingButton } from '@mui/lab'
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import React, { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'
import { AutoCompleteItem } from 'ui/shared/components/Autocomplete'
import PageSection from 'ui/shared/components/PageSection'
import _ from 'lodash'
import { unstable_batchedUpdates } from 'react-dom'
import { SearchStoriesRequest } from '@hatsuportal/contracts'
import { OrderEnum, VisibilityEnum } from '@hatsuportal/common'

export const defaultFilters = {
  storiesPerPage: 50,
  pageNumber: 0,
  orderBy: 'name',
  order: OrderEnum.Ascending
}

type SearchFilters = Omit<SearchStoriesRequest, 'order' | 'orderBy'>

interface TableFiltersProps {
  onSearch: (filters: SearchFilters) => void
  filters: SearchStoriesRequest
  setFilters: React.Dispatch<React.SetStateAction<SearchStoriesRequest>>
  loading: boolean
}

const StoryTableFilters: React.FC<TableFiltersProps> = ({ onSearch, filters, setFilters, loading }) => {
  const [visibilityFilter, setVisibilityFilter] = useState<SearchStoriesRequest['visibility']>(filters.visibility || [])
  const [searchFilter, setSearchFilter] = useState(filters.search)
  const [onlyMyStories, setOnlyMyStories] = useState(filters.onlyMyStories != null ? filters.onlyMyStories : false)
  const [hasImageFilter, setHasImageFilter] = useState<boolean | null>(typeof filters.hasImage === 'undefined' ? null : filters.hasImage)
  const [authState] = useAtom(authAtom)

  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  const onEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 13) {
      internalOnSearch()
    }
  }

  const onClearSearch = () => {
    setSearchFilter('')
  }

  const onToggleOnlyMyStories = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFilters((_storyTableFilters) => {
      return {
        ..._storyTableFilters,
        onlyMyStories: checked
      }
    })
  }

  const onSelectHasImageFilter = (value: boolean | null) => () => {
    setHasImageFilter(value)
  }

  useEffect(() => {
    if (filters.onlyMyStories !== onlyMyStories) {
      setOnlyMyStories(filters.onlyMyStories || false)
    }
  }, [filters.onlyMyStories])

  const clearFiltersAndSearch = () => {
    unstable_batchedUpdates(() => {
      setVisibilityFilter([])
      setSearchFilter('')
      setOnlyMyStories(false)
      setHasImageFilter(null)
    })
    setTimeout(() => {
      const searchFilters: SearchFilters = {
        visibility: [],
        search: '',
        onlyMyStories: false,
        hasImage: null
      }
      onSearch(searchFilters)
    }, 500)
  }

  const internalOnSearch = () => {
    const searchFilters: SearchFilters = {
      search: searchFilter,
      visibility: visibilityFilter,
      hasImage: hasImageFilter,
      onlyMyStories: onlyMyStories
    }
    onSearch(searchFilters)
  }

  const filterStoryMinWidth = '14em'

  return (
    <PageSection
      sx={{
        margin: '1em 0 2em 0',
        borderRadius: '0.6em',
        zIndex: '100',
        boxSizing: 'border-box',
        display: 'inline-flex',
        flexDirection: 'column',
        width: '100%',
        gap: '1em'
      }}
    >
      <Typography variant="h5" color={(theme) => theme.palette.getContrastText(theme.palette.background.paper)}>
        Filters
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isSmall ? 'column' : 'row',
          flexWrap: 'wrap',
          alignStories: isSmall ? 'flex-start' : 'flex-end',
          '& > *': {
            flex: isSmall ? '1 1 100%' : '0 1 32%',
            minWidth: filterStoryMinWidth,
            width: isSmall ? '100%' : 'auto'
          },
          gap: '1em'
        }}
      >
        <Box>
          <FormLabel sx={{ fontSize: '1em', color: (theme) => theme.palette.getContrastText(theme.palette.background.paper) }}>
            Has Image
          </FormLabel>
          <Box sx={{ display: 'flex', gap: '0.5em' }}>
            <ButtonGroup
              variant="contained"
              disabled={loading}
              sx={{
                border: `1px solid ${theme.palette.primary.dark}`,
                '& > button': { fontWeight: '500' },
                '& > ..MuiButtonGroup-middleButton': {
                  borderRight: `1px solid ${theme.palette.primary.dark}`
                }
              }}
              disableElevation={true}
            >
              <Button onClick={onSelectHasImageFilter(null)} color={hasImageFilter === null ? 'secondary' : 'primary'}>
                Any
              </Button>
              <Button onClick={onSelectHasImageFilter(true)} color={hasImageFilter === true ? 'secondary' : 'primary'}>
                Include
              </Button>
              <Button onClick={onSelectHasImageFilter(false)} color={hasImageFilter === false ? 'secondary' : 'primary'}>
                Exclude
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
        <TextField
          id={'search-filter'}
          value={searchFilter || ''}
          label={'Word Search'}
          disabled={loading}
          size="small"
          color="secondary"
          onChange={(event) => setSearchFilter(event.target.value)}
          onKeyDown={onEnter}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
            sx: {
              color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
            }
          }}
          sx={{
            width: 'max-content',
            margin: '1em 0 0 0'
          }}
        />
        {authState.loggedIn && (
          <Autocomplete
            multiple
            clearOnBlur
            disableCloseOnSelect
            disabled={loading}
            size="small"
            id="visibility-filter"
            options={Object.values(VisibilityEnum).map((visibility) => visibility.toString().toLowerCase())}
            getOptionLabel={(option) => option.replaceAll('_', ' ')}
            onChange={(_, newFilters) => setVisibilityFilter(newFilters as SearchStoriesRequest['visibility'])}
            value={visibilityFilter}
            PaperComponent={AutoCompleteItem}
            ChipProps={{
              sx: {
                color: (theme) => theme.palette.getContrastText(theme.palette.info.main),
                background: theme.palette.info.main,
                '& > .MuiChip-deleteIcon': {
                  color: (theme) => theme.palette.getContrastText(theme.palette.info.main),
                  background: theme.palette.info.main
                },
                '& > .MuiChip-deleteIcon:hover': {
                  color: (theme) => theme.palette.primary.main
                }
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Visibility"
                size="small"
                color="secondary"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
                  }
                }}
              />
            )}
            sx={{ margin: '1em 0 0 0' }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          '& > *': {
            flex: '1 1 100%'
          },
          gap: '1em'
        }}
      >
        <Box sx={{ display: 'flex', alignStories: 'center', justifyContent: 'space-between', '&&': { flex: '1 1 100%' } }}>
          {authState.loggedIn ? (
            <FormGroup sx={{ alignStories: 'flex-start' }}>
              <FormControlLabel
                sx={{
                  marginRight: 0,
                  whiteSpace: 'nowrap',
                  color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
                }}
                control={
                  <Checkbox
                    disabled={loading}
                    checked={onlyMyStories}
                    color="secondary"
                    onChange={onToggleOnlyMyStories}
                    sx={{
                      color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
                    }}
                  />
                }
                label="Show only my stories"
              />
            </FormGroup>
          ) : (
            <div />
          )}
          <Box sx={{ display: 'flex', gap: '1em' }}>
            <LoadingButton loading={loading} variant="contained" color="primary" endIcon={<SearchIcon />} onClick={clearFiltersAndSearch}>
              Clear Filters and Search
            </LoadingButton>
            <LoadingButton loading={loading} variant="contained" color="primary" endIcon={<SearchIcon />} onClick={internalOnSearch}>
              Search
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </PageSection>
  )
}

export default StoryTableFilters
