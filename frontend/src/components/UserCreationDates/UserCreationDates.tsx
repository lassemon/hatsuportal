import { UserResponseDTO } from '@hatsuportal/application'
import { dateStringFromUnixTime } from '@hatsuportal/common'
import { Box, Typography } from '@mui/material'
import React from 'react'

interface UserCreationDatesProps {
  user?: UserResponseDTO
}

const UserCreationDates: React.FC<UserCreationDatesProps> = ({ user }) => {
  return (
    <Box
      sx={{
        display: 'flex',
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
