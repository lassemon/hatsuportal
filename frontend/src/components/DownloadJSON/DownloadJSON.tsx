import React from 'react'
import { Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { unixtimeNow } from '@hatsuportal/common'

interface DownloadJSONProps {
  data: { [key: string]: any }
  fileName: string
}

const DownloadJSON: React.FC<DownloadJSONProps> = (props) => {
  const { children, data, fileName } = props

  const downloadFile = () => {
    // Assuming myData is the state you want to download
    const _fileName = `${fileName}_${unixtimeNow()}`
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const href = URL.createObjectURL(blob)

    // Create a new anchor element
    const link = document.createElement('a')
    link.href = href
    link.download = _fileName + '.json'

    // Append to the body, click and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(href)
  }

  return (
    <Button variant="contained" onClick={downloadFile} startIcon={<FileDownloadIcon />} sx={{ whiteSpace: 'nowrap' }}>
      {children}
    </Button>
  )
}

export default DownloadJSON
