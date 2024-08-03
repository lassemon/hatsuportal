import { ListItemButton, ListItemButtonProps, ListItemIcon, ListItemIconProps, ListItemText } from '@mui/material'
import { breadcrumbAtom } from 'ui/state/breadcrumbAtom'
import { useAtom } from 'jotai'
import { Link } from 'react-router-dom'

interface ListItemLinkProps {
  icon?: React.ReactElement<unknown>
  primary: string
  to: string
  sx?: ListItemButtonProps['sx']
  IconProps?: ListItemIconProps
}

export const ListItemLink: React.FC<ListItemLinkProps> = (props: ListItemLinkProps) => {
  const { icon, primary, to, sx, IconProps } = props

  const [, setBreadcrumbs] = useAtom(breadcrumbAtom)

  return (
    <ListItemButton component={Link} to={to} sx={sx} onClick={() => setBreadcrumbs([{ label: primary, href: to }])}>
      {icon ? <ListItemIcon {...IconProps}>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} />
    </ListItemButton>
  )
}
