import { VisibilityEnum } from '@hatsuportal/common'
import { Autocomplete, Box, Divider, IconButton, InputAdornment, TextField, Typography, useTheme } from '@mui/material'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { AutoCompleteItem } from 'ui/shared/components/Autocomplete'
import { authAtom } from 'ui/state/authAtom'
import ClearIcon from '@mui/icons-material/Clear'
import { SearchPostsRequest } from '@hatsuportal/contracts'
import FilterListIcon from '@mui/icons-material/FilterList'
import { LoadingButton } from '@mui/lab'
import SearchIcon from '@mui/icons-material/Search'
import { unstable_batchedUpdates } from 'react-dom'

type SearchFilters = Omit<SearchPostsRequest, 'order' | 'orderBy'>

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void
  filters: SearchPostsRequest
  setFilters: React.Dispatch<React.SetStateAction<SearchPostsRequest>>
  loading: boolean
}

const PostSearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, filters, setFilters, loading }) => {
  const [visibilityFilter, setVisibilityFilter] = useState<SearchPostsRequest['visibility']>(filters.visibility || [])
  const [searchFilter, setSearchFilter] = useState(filters.search)

  const theme = useTheme()

  const [authState] = useAtom(authAtom)

  const onEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 13) {
      internalOnSearch()
    }
  }

  const clearFiltersAndSearch = () => {
    unstable_batchedUpdates(() => {
      setVisibilityFilter([])
      setSearchFilter('')
    })
    setTimeout(() => {
      const searchFilters: SearchFilters = {
        visibility: [],
        search: ''
      }
      onSearch(searchFilters)
    }, 500)
  }

  const onClearSearch = () => {
    setSearchFilter('')
  }

  const internalOnSearch = () => {
    const searchFilters: SearchFilters = {
      search: searchFilter,
      visibility: visibilityFilter
    }
    onSearch(searchFilters)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5em',
        margin: '1em 0',
        backgroundColor: (theme) => theme.palette.background.default,
        padding: '0.75em 1.5em 0.75em 0.75em',
        borderRadius: '0.5em'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <FilterListIcon />
        <Typography variant="h6" sx={{ flex: '1 1 100%', margin: '0 0.5em 0 0 ' }}>
          Filters:
        </Typography>
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
          margin: '0.5em 0 0 0'
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
          onChange={(_, newFilters) => setVisibilityFilter(newFilters as SearchPostsRequest['visibility'])}
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
          sx={{ minWidth: '14em', margin: '0.5em 0 0 0' }}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em', margin: '0.5em 0 0 0' }}>
        <Divider orientation="vertical" flexItem sx={{ height: '50%', alignSelf: 'center' }} />
        <Typography sx={{ cursor: 'pointer', opacity: 0.5 }} onClick={clearFiltersAndSearch}>
          Clear all
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: '1em', height: '2.5em', flex: '1 1 100%', justifyContent: 'flex-end' }}>
        <LoadingButton
          sx={{ flex: '0 0 auto' }}
          loading={loading}
          variant="contained"
          color="primary"
          endIcon={<SearchIcon />}
          onClick={internalOnSearch}
        >
          Search
        </LoadingButton>
      </Box>
    </Box>
  )
}

export default PostSearchFilters
