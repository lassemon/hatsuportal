import { Breadcrumb, breadcrumbAtom } from 'ui/shared/state/breadcrumbAtom'
import { useAtom } from 'jotai'
import last from 'lodash/last'
import { NavigateOptions, useNavigate as rrDomUseNavigate } from 'react-router-dom'

export const useNavigate = () => {
  const navigate = rrDomUseNavigate()
  const [, setBreadcrumbs] = useAtom(breadcrumbAtom)

  return (breadcumbs: Breadcrumb[], options?: NavigateOptions) => {
    setBreadcrumbs(breadcumbs)
    console.log('setting breadcrumbs', breadcumbs)
    return navigate(last(breadcumbs)?.href || '/', options)
  }
}
