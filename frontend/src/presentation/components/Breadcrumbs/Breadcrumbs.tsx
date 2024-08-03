import { Typography, Breadcrumbs as MUIBreadcrumbs } from '@mui/material'
import { breadcrumbAtom } from 'application/state/atoms/breadcrumbAtom'
import { useAtom } from 'jotai'
import { Link } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'

interface BreadcrumbLinkProps {
  to: string
  onClick: () => void
}

export const useStyles = makeStyles()(() => ({
  breadcrumbLink: {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' }
  }
}))

const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({ to, children, onClick }) => {
  const { classes } = useStyles()
  return (
    <Typography variant="h5" noWrap component="div">
      <Link className={classes.breadcrumbLink} to={to} onClick={onClick}>
        {children}
      </Link>
    </Typography>
  )
}

export const Breadcrumbs: React.FC = () => {
  const [breadcrumbs, setBreadcrumbs] = useAtom(breadcrumbAtom)

  return (
    <MUIBreadcrumbs aria-label="breadcrumb" sx={{ color: (theme) => theme.palette.getContrastText(theme.palette.primary.main) }}>
      <BreadcrumbLink to="/" onClick={() => setBreadcrumbs([])}>
        HatsuPortal
      </BreadcrumbLink>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1

        return isLast ? (
          <Typography variant="h6" noWrap component="div" key={crumb.href} sx={{ color: (theme) => theme.palette.action.active }}>
            {crumb.label}
          </Typography>
        ) : (
          <BreadcrumbLink key={crumb.href} to={crumb.href} onClick={() => setBreadcrumbs([crumb])}>
            {crumb.label}
          </BreadcrumbLink>
        )
      })}
    </MUIBreadcrumbs>
  )
}
