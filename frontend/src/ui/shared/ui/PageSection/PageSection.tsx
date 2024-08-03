import React from 'react'
import { Paper, PaperProps } from '@mui/material'
import { useSize } from 'ui/shared/hooks/useSize'

interface PageSectionProps extends PaperProps {}

const PageSection: React.FC<PageSectionProps> = (props) => {
  const { isTiny } = useSize()
  return (
    <Paper
      {...{
        ...props,
        sx: {
          ...{ margin: isTiny ? '2em 0em' : '2em', padding: '0em' },
          ...props.sx
        }
      }}
    />
  )
}

export default PageSection
