import React from 'react'
import { Paper, PaperProps } from '@mui/material'

interface PageSectionProps extends PaperProps {}

const PageSection: React.FC<PageSectionProps> = (props) => {
  return (
    <Paper
      {...{
        ...props,
        sx: {
          ...{ margin: '2em', padding: '1em' },
          ...props.sx
        }
      }}
    />
  )
}

export default PageSection
