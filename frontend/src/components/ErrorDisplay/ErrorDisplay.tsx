import { Snackbar, Typography } from '@mui/material'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { StorageParseError, StorageSyncError } from 'domain/errors/StorageError'
import { useAtom } from 'jotai'
import React from 'react'
import { errorAtom } from 'infrastructure/dataAccess/atoms'
import { ApiError } from '@hatsuportal/domain'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ErrorDisplay: React.FC = () => {
  const [error, setError] = useAtom(errorAtom)

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setError(null)
  }

  if (!error) {
    return null
  }

  const isRequestAbortError = error instanceof DOMException && error.message === 'The user aborted a request.'
  if (isRequestAbortError) {
    return null
  }

  let errorHeader = `Error: `

  switch (error.constructor) {
    case StorageSyncError:
      errorHeader += 'Saving change to storage failed. This is most commonly caused by too large image file. Try uploading a smaller image.'
      break
    case StorageParseError:
      errorHeader += 'Invalid data. Parsing failed!'
      break
    case ApiError:
      errorHeader += 'Request failed.'
      break
    default:
      errorHeader += (error as any)?.statusText || 'Unknown error'
      console.error(error)
  }

  return (
    <Snackbar open={!!error} autoHideDuration={120000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        <Typography variant="body2">{errorHeader}</Typography>
        <Typography variant="body2" sx={{ margin: '0 0 0 0.5em' }}>
          <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
            {error.message}
          </Typography>
        </Typography>
      </Alert>
    </Snackbar>
  )
}

export default ErrorDisplay
