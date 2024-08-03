import { Box, BoxProps } from '@mui/material'
import { useSize } from 'ui/shared/hooks/useSize'

const Panel: React.FC<BoxProps> = ({ children, ...props }) => {
  const { isTiny } = useSize()

  return (
    <Box
      {...props}
      sx={{
        display: 'flex',
        flex: 1,
        gap: '1em',
        borderRadius: isTiny ? 0 : 2,
        backgroundColor: (theme) => theme.palette.background.default,
        padding: 2,
        ...props.sx
      }}
    >
      {children}
    </Box>
  )
}

export default Panel
