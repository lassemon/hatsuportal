import _ from 'lodash'

export const getPageName = () => {
  return _.head(_.without(window.location.pathname.split('/'), ''))
}
