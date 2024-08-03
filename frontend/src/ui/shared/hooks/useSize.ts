import { useMediaQuery, useTheme } from '@mui/material'

export const useSize = () => {
  const theme = useTheme()
  const isLarge = useMediaQuery(theme.breakpoints.down('xl'))
  const isMedium = useMediaQuery(theme.breakpoints.down('lg'))
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const isTiny = useMediaQuery(theme.breakpoints.down('sm'))
  return { isTiny, isSmall, isMedium, isLarge }
}
