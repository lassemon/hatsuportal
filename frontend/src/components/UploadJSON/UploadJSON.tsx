import * as React from 'react'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { useAtom } from 'jotai'
import { errorAtom } from 'infrastructure/dataAccess/atoms'
import { StorageParseError } from 'domain/errors/StorageError'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const UploadButton: React.FC<{ onUpload: (file?: { [key: string]: any }) => void }> = (props) => {
  const { children, onUpload } = props
  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))

  const readFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    if (event.target.files) {
      fileReader.readAsText(event.target.files[0], 'UTF-8')
      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const parsedJSON = JSON.parse(event?.target?.result?.toString() || '')

          if (parsedJSON) {
            onUpload(parsedJSON as { [key: string]: any })
          }
        } catch (error) {
          console.error(error)
          setError(new StorageParseError(error?.toString()))
        }
      }
    }
  }

  const reset = (event: any) => {
    event.target.value = ''
  }

  return (
    <Button component="label" variant="contained" startIcon={<FileUploadIcon />} sx={{ whiteSpace: 'nowrap' }}>
      {children}
      <VisuallyHiddenInput type="file" onChange={readFile} onClick={reset} accept="application/JSON" />
    </Button>
  )
}

export default UploadButton
