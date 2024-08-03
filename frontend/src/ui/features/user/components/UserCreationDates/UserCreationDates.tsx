import { UserViewModelDTO } from 'ui/features/user/viewModels/UserViewModel'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { dateStringFromUnixTime } from '@hatsuportal/common'

interface UserCreationDatesProps {
  user?: UserViewModelDTO
}

const UserCreationDates: React.FC<UserCreationDatesProps> = ({ user }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        opacity: 0.4,
        gap: '0.2em',
        flexDirection: 'column',
        '& > .MuiTypography-root': {
          display: 'flex',
          gap: '1em'
        }
      }}
    >
      {user?.createdAt && (
        <Typography variant="body2" color={(theme) => theme.palette.info.main}>
          <span>Account created:</span> <span>{`{ ${dateStringFromUnixTime(user.createdAt)} }`}</span>
        </Typography>
      )}
      {user?.updatedAt && (
        <Typography variant="body2" color={(theme) => theme.palette.info.main}>
          <span>Account last updated:</span> <span>{`{ ${dateStringFromUnixTime(user.updatedAt)} }`}</span>
        </Typography>
      )}
    </Box>
  )
}

export default UserCreationDates
