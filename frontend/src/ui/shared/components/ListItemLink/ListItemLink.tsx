import { ListItemButton, ListItemButtonProps, ListItemIcon, ListItemIconProps, ListItemText } from '@mui/material'
import { breadcrumbAtom } from 'ui/state/breadcrumbAtom'
import { useAtom } from 'jotai'
import { Link } from 'react-router-dom'

interface ListItemLinkProps {
  icon?: React.ReactElement<unknown>
  text: string
  breadcrumb?: string
  to: string
  sx?: ListItemButtonProps['sx']
  IconProps?: ListItemIconProps
}

export const ListItemLink: React.FC<ListItemLinkProps> = (props: ListItemLinkProps) => {
  const { icon, text, breadcrumb, to, sx, IconProps } = props

  const [, setBreadcrumbs] = useAtom(breadcrumbAtom)

  return (
    <ListItemButton
      component={Link}
      to={to}
      sx={sx}
      onClick={() => {
        const breadcrumbLabel = breadcrumb !== undefined ? breadcrumb : text
        if (breadcrumbLabel !== undefined) setBreadcrumbs([{ label: breadcrumbLabel, href: to }])
      }}
    >
      {icon ? <ListItemIcon {...IconProps}>{icon}</ListItemIcon> : null}
      <ListItemText primary={text} />
    </ListItemButton>
  )
}
