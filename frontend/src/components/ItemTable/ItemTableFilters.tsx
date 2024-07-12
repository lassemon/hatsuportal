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
import { SearchItemsRequestDTO } from '@hatsuportal/application'
import React, { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { authAtom } from 'infrastructure/dataAccess/atoms'
import { Visibility } from '@hatsuportal/domain'
import { AutoCompleteItem } from 'components/Autocomplete/AutocompleteItem'
import _ from 'lodash'
import { unstable_batchedUpdates } from 'react-dom'
import { Order } from '@hatsuportal/domain'
import PageSection from 'components/PageSection'

export const defaultFilters = {
  itemsPerPage: 50,
  pageNumber: 0,
  orderBy: 'name',
  order: Order.Ascending
}

type SearchFilters = Omit<SearchItemsRequestDTO, 'order' | 'orderBy'>

interface TableFiltersProps {
  onSearch: (filters: SearchFilters) => void
  filters: SearchItemsRequestDTO
  setFilters: React.Dispatch<React.SetStateAction<SearchItemsRequestDTO>>
  loading: boolean
}

const ItemTableFilters: React.FC<TableFiltersProps> = ({ onSearch, filters, setFilters, loading }) => {
  const [visibilityFilter, setVisibilityFilter] = useState<SearchItemsRequestDTO['visibility']>(filters.visibility || [])
  const [searchFilter, setSearchFilter] = useState(filters.search)
  const [onlyMyItems, setOnlyMyItems] = useState(filters.onlyMyItems != null ? filters.onlyMyItems : false)
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

  const onToggleOnlyMyItems = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFilters((_itemTableFilters) => {
      return {
        ..._itemTableFilters,
        onlyMyItems: checked
      }
    })
  }

  const onSelectHasImageFilter = (value: boolean | null) => () => {
    setHasImageFilter(value)
  }

  useEffect(() => {
    if (filters.onlyMyItems !== onlyMyItems) {
      setOnlyMyItems(filters.onlyMyItems || false)
    }
  }, [filters.onlyMyItems])

  const clearFiltersAndSearch = () => {
    unstable_batchedUpdates(() => {
      setVisibilityFilter([])
      setSearchFilter('')
      setOnlyMyItems(false)
      setHasImageFilter(null)
    })
    setTimeout(() => {
      const searchFilters: SearchFilters = {
        visibility: [],
        search: '',
        onlyMyItems: false,
        hasImage: null
      }
      onSearch(searchFilters)
    }, 500)
  }

  const internalOnSearch = () => {
    const searchFilters: SearchFilters = {
      search: searchFilter,
      visibility: visibilityFilter,
      hasImage: hasImageFilter
    }
    onSearch(searchFilters)
  }

  const filterItemMinWidth = '14em'

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
          alignItems: isSmall ? 'flex-start' : 'flex-end',
          '& > *': {
            flex: isSmall ? '1 1 100%' : '0 1 32%',
            minWidth: filterItemMinWidth,
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
            options={Object.values(Visibility).map((visibility) => visibility.toString().toLowerCase())}
            getOptionLabel={(option) => option.replaceAll('_', ' ')}
            onChange={(_, newFilters) => setVisibilityFilter(newFilters as SearchItemsRequestDTO['visibility'])}
            value={visibilityFilter}
            PaperComponent={AutoCompleteItem}
            ChipProps={{
              sx: {
                color: (theme) => theme.palette.getContrastText(theme.palette.info.main),
                background: theme.palette.info.main,
                '& >  .MuiChip-deleteIcon': {
                  color: (theme) => theme.palette.getContrastText(theme.palette.info.main),
                  background: theme.palette.info.main
                },
                '& >  .MuiChip-deleteIcon:hover': {
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&&': { flex: '1 1 100%' } }}>
          {authState.loggedIn ? (
            <FormGroup sx={{ alignItems: 'flex-start' }}>
              <FormControlLabel
                sx={{
                  marginRight: 0,
                  whiteSpace: 'nowrap',
                  color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
                }}
                control={
                  <Checkbox
                    disabled={loading}
                    checked={onlyMyItems}
                    color="secondary"
                    onChange={onToggleOnlyMyItems}
                    sx={{
                      color: (theme) => theme.palette.getContrastText(theme.palette.background.paper)
                    }}
                  />
                }
                label="Show only my items"
              />
            </FormGroup>
          ) : (
            <div />
          )}
          <Box sx={{ display: 'flex', gap: '1em' }}>
            <LoadingButton loading={loading} variant="contained" color="secondary" endIcon={<SearchIcon />} onClick={clearFiltersAndSearch}>
              Clear Filters and Search
            </LoadingButton>
            <LoadingButton loading={loading} variant="contained" color="secondary" endIcon={<SearchIcon />} onClick={internalOnSearch}>
              Search
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </PageSection>
  )
}

export default ItemTableFilters
