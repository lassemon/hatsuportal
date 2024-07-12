import { DateTime, DurationLike } from 'luxon'

interface UnixtimeNowProps {
  add?: DurationLike
  substract?: DurationLike
}

export const unixtimeNow = (props?: UnixtimeNowProps): number => {
  let dateTime = DateTime.now()
  if (props && props.add) {
    dateTime = dateTime.plus(props.add)
  } else if (props && props.substract) {
    dateTime = dateTime.minus(props.substract)
  }
  return dateTime.toUnixInteger()
}

export const dateStringFromUnixTime = (unixtime: number): string => {
  return DateTime.fromSeconds(unixtime).setZone('Europe/Helsinki').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
}
