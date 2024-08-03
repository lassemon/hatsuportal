import { alpha, styled, useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import { InputBase, useMediaQuery } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'

const Search = styled('div', {
  shouldForwardProp: (prop) => prop !== 'compactOpen'
})<{ compactOpen?: boolean }>(({ theme, compactOpen }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    width: 'auto',
    minHeight: theme.spacing(5),
    cursor: compactOpen ? undefined : 'pointer',
    ...(!compactOpen && {
      width: theme.spacing(5),
      minWidth: theme.spacing(5)
    })
  },
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto'
  }
}))

const SearchIconWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'compactOpen'
})<{ compactOpen?: boolean }>(({ theme, compactOpen }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 2),
    height: '100%'
  },
  [theme.breakpoints.down('sm')]: {
    ...(compactOpen
      ? {
          width: 'auto',
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(1),
          justifyContent: 'flex-start'
        }
      : {
          width: '100%',
          justifyContent: 'center'
        })
  }
}))

const StyledInputBase = styled(InputBase, {
  shouldForwardProp: (prop) => prop !== 'compactOpen'
})<{ compactOpen?: boolean }>(({ theme, compactOpen }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create(['width', 'opacity']),
    [theme.breakpoints.up('sm')]: {
      width: '8ch',
      '&:focus': {
        width: '20ch'
      }
    },
    [theme.breakpoints.down('sm')]: {
      width: compactOpen ? '20ch' : 0,
      minWidth: 0,
      paddingLeft: compactOpen ? `calc(1em + ${theme.spacing(4)})` : 0,
      paddingRight: compactOpen ? undefined : 0,
      opacity: compactOpen ? 1 : 0
    }
  }
}))

export const SearchBox: React.FC = () => {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'))
  const [compactOpen, setCompactOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const openCompact = useCallback(() => {
    if (!isCompact) return
    setCompactOpen(true)
    inputRef.current?.focus()
  }, [isCompact])

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (!isCompact) return
      if (!event.currentTarget.value.trim()) {
        setCompactOpen(false)
      }
    },
    [isCompact]
  )

  useEffect(() => {
    if (!isCompact) setCompactOpen(false)
  }, [isCompact])

  return (
    <Search
      compactOpen={isCompact && compactOpen}
      onClick={isCompact && !compactOpen ? openCompact : undefined}
      role={isCompact && !compactOpen ? 'button' : undefined}
      aria-label={isCompact && !compactOpen ? 'Open search' : undefined}
    >
      <SearchIconWrapper compactOpen={isCompact && compactOpen}>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        compactOpen={isCompact && compactOpen}
        inputRef={inputRef}
        placeholder="Search…"
        inputProps={{ 'aria-label': 'search' }}
        onFocus={() => isCompact && setCompactOpen(true)}
        onBlur={handleBlur}
      />
    </Search>
  )
}
