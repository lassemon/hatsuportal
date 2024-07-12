import _, { capitalize } from 'lodash'
import { v4 as _uuid } from 'uuid'

export const getNumberWithSign = (theNumber: number) => {
  if (theNumber > 0) {
    return '+' + theNumber
  } else {
    return theNumber?.toString()
  }
}

export const replaceItemAtIndex = <T>(arr: T[], index: number, newValue: T) => {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
}

export const upsertToArray = <T>(arr: T[], obj: T, key: keyof T): T[] => {
  const array = [...arr]
  const index = array.findIndex((element) => element[key] === obj[key])

  if (index === -1) {
    array.push(obj)
  } else {
    array[index] = obj
  }
  return array
}

export const formatKeyString = (key: string) => {
  return key
    .replaceAll('_', ' ')
    .split(' ')
    .map((part) => capitalize(part))
    .join(' ')
}

export const objectWithoutEmptyOrUndefined = <T extends { [key: string]: any }>(object: T) => {
  return _(object)
    .omitBy((value) => value === '' || typeof value === 'undefined')
    .valueOf()
}

export const getlowestfraction = (x0: number) => {
  var eps = 1.0e-15
  var h, h1, h2, k, k1, k2, a, x

  x = x0
  a = Math.floor(x)
  h1 = 1
  k1 = 0
  h = a
  k = 1

  while (x - a > eps * k * k) {
    x = 1 / (x - a)
    a = Math.floor(x)
    h2 = h1
    h1 = h
    k2 = k1
    k1 = k
    h = h2 + a * h1
    k = k2 + a * k1
  }

  return h + '/' + k
}

export const scheduleAsyncFunction = async (
  asyncFunction: Function,
  timeout: number,
  shouldContinue: () => boolean,
  setTimeoutId: (id: NodeJS.Timeout | undefined) => void,
  setCurrentPromise: (promise: Promise<any>) => void
) => {
  if (shouldContinue()) {
    const promise = asyncFunction().finally(() => {
      const timeoutId = setTimeout(scheduleAsyncFunction, timeout, asyncFunction, timeout, shouldContinue, setTimeoutId, setCurrentPromise)
      setTimeoutId(timeoutId)
    })
    setCurrentPromise(promise)
  }
}

export const isPromise = <T>(value: T | Promise<T>): value is Promise<T> => {
  return !!value && typeof (value as any).then === 'function'
}

export const highlightTextPart = (text?: string, toHighlightPart?: string) => {
  if (text && toHighlightPart) {
    const regexp = new RegExp(toHighlightPart, 'gi')
    return text.replaceAll(regexp, '<span class="highlight">' + toHighlightPart + '</span>')
  }
  return '<span>' + text + '</span>'
}
