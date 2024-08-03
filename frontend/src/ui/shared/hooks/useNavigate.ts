import { Breadcrumb, breadcrumbAtom } from 'ui/shared/state/breadcrumbAtom'
import { useSetAtom } from 'jotai'
import last from 'lodash/last'
import { NavigateOptions, useNavigate as rrDomUseNavigate } from 'react-router-dom'

export const useNavigate = () => {
  const navigate = rrDomUseNavigate()
  const setBreadcrumbs = useSetAtom(breadcrumbAtom)

  return (breadcumbs: Breadcrumb[], options?: NavigateOptions) => {
    setBreadcrumbs(breadcumbs)
    console.log('setting breadcrumbs', breadcumbs)
    return navigate(last(breadcumbs)?.href || '/', options)
  }
}
