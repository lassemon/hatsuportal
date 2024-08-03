import { Typography, Breadcrumbs as MUIBreadcrumbs } from '@mui/material'
import { breadcrumbAtom } from 'ui/state/breadcrumbAtom'
import { useAtom } from 'jotai'
import { Link } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'

interface BreadcrumbLinkProps {
  to: string
  onClick: () => void
}

export const useStyles = makeStyles()((theme) => ({
  breadcrumbLink: {
    color: theme.palette.getContrastText(theme.palette.background.paper),
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' }
  }
}))

const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({ to, children, onClick }) => {
  const { classes } = useStyles()
  return (
    <Typography variant="body1" noWrap component="div">
      <Link className={classes.breadcrumbLink} to={to} onClick={onClick}>
        {children}
      </Link>
    </Typography>
  )
}

export const Breadcrumbs: React.FC = () => {
  const [breadcrumbs, setBreadcrumbs] = useAtom(breadcrumbAtom)

  return (
    <MUIBreadcrumbs
      aria-label="breadcrumb"
      sx={{ padding: '0 1em', color: (theme) => theme.palette.getContrastText(theme.palette.background.paper) }}
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1

        return isLast ? (
          <Typography
            variant="body2"
            noWrap
            component="div"
            key={crumb.href}
            sx={{
              fontWeight: 400,
              letterSpacing: '0.1rem'
            }}
          >
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
