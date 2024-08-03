import { DateTime, DurationLike } from 'luxon'

interface UnixtimeNowProps {
  add?: DurationLike
  substract?: DurationLike
}

// this is just a format I like, deal with it.
const DATE_TIME_FORMAT = 'dd/MM/yyyy, HH:mm:ss'

export const unixtimeNow = (props?: UnixtimeNowProps): number => {
  let dateTime = DateTime.now().setZone('Europe/Helsinki')
  if (props && props.add) {
    dateTime = dateTime.plus(props.add)
  } else if (props && props.substract) {
    dateTime = dateTime.minus(props.substract)
  }
  return dateTime.toUnixInteger()
}

export const dateTimeNow = () => {
  return DateTime.now().setZone('Europe/Helsinki')
}

export const dateStringFromUnixTime = (unixtime: number): string => {
  return DateTime.fromSeconds(unixtime).setZone('Europe/Helsinki').toFormat(DATE_TIME_FORMAT)
}

export const getTimestamp = (format: string) => {
  return DateTime.now().setZone('Europe/Helsinki').toFormat(format)
}
