import { isNumber, isRecord, isString } from '@hatsuportal/common'
import { ThemeColors } from '@hatsuportal/contracts'
import { ThemeViewModelDTO } from 'ui/entities/user/model/ThemeViewModel'

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/
const REQUIRED_COLOR_KEYS = ['primary', 'backgroundPrimary', 'backgroundSecondary', 'callToAction'] as const

function isValidColors(value: unknown): value is ThemeColors['lightColors'] {
  if (!isRecord(value)) {
    return false
  }

  return REQUIRED_COLOR_KEYS.every((key) => {
    const color = (value as Record<string, unknown>)[key]
    return typeof color === 'string' && HEX_COLOR_PATTERN.test(color)
  })
}

export function parseThemeCache(raw: string | null): ThemeViewModelDTO | null {
  if (raw === null) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) {
      return null
    }

    const record = parsed as Record<string, unknown>
    if (!isValidColors(record.lightColors) || !isValidColors(record.darkColors)) {
      return null
    }

    return {
      id: isString(record.id) ? record.id : '',
      name: isString(record.name) ? record.name : '',
      createdById: isString(record.createdById) ? record.createdById : '',
      createdAt: isNumber(record.createdAt) ? record.createdAt : 0,
      updatedAt: isNumber(record.updatedAt) ? record.updatedAt : 0,
      lightColors: record.lightColors,
      darkColors: record.darkColors
    }
  } catch {
    return null
  }
}
