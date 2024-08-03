import { Breadcrumb, breadcrumbAtom } from 'ui/state/breadcrumbAtom'
import { useAtom } from 'jotai'
import _ from 'lodash'
import { NavigateOptions, useNavigate as rrDomUseNavigate } from 'react-router-dom'

export const useNavigate = () => {
  const navigate = rrDomUseNavigate()
  const [, setBreadcrumbs] = useAtom(breadcrumbAtom)

  return (breadcumbs: Breadcrumb[], options?: NavigateOptions) => {
    setBreadcrumbs(breadcumbs)
    console.log('setting breadcrumbs', breadcumbs)
    return navigate(_.last(breadcumbs)?.href || '/', options)
  }
}
