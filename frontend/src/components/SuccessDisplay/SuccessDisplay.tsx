import { Snackbar, Typography } from '@mui/material'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { useAtom } from 'jotai'
import React from 'react'
import { successAtom } from 'infrastructure/dataAccess/atoms'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const SuccessDisplay: React.FC = () => {
  const [success, setSuccess] = useAtom(successAtom)

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setSuccess(null)
  }

  if (!success) {
    return null
  }

  return (
    <Snackbar open={!!success} autoHideDuration={3500} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        <Typography variant="body2" sx={{ margin: '0 0 0 0.5em' }}>
          <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
            {success.message}
          </Typography>
        </Typography>
      </Alert>
    </Snackbar>
  )
}

export default SuccessDisplay
