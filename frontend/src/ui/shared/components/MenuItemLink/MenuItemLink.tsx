import { ListItemIcon, ListItemIconProps, MenuItem, MenuItemProps, ListItemText } from '@mui/material'
import { useAtom } from 'jotai'
import { Link } from 'react-router-dom'
import { breadcrumbAtom } from 'ui/state/breadcrumbAtom'

interface MenuItemLinkProps {
  icon?: React.ReactElement<unknown>
  text: string
  breadcrumbLabel?: string
  to: string
  sx?: MenuItemProps['sx']
  IconProps?: ListItemIconProps
  onClick?: () => void
}

export const MenuItemLink: React.FC<MenuItemLinkProps> = (props: MenuItemLinkProps) => {
  const { icon, text, breadcrumbLabel, to, sx, IconProps, onClick } = props

  const [, setBreadcrumbs] = useAtom(breadcrumbAtom)

  return (
    <MenuItem
      component={Link}
      to={to}
      sx={sx}
      onClick={() => {
        setBreadcrumbs([{ label: breadcrumbLabel === '' ? breadcrumbLabel : text, href: to }])
        onClick?.()
      }}
    >
      {icon ? <ListItemIcon {...IconProps}>{icon}</ListItemIcon> : null}
      <ListItemText primary={text} />
    </MenuItem>
  )
}
