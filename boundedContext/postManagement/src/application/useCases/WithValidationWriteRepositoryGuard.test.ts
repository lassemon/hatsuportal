import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const useCasesRoot = __dirname

function collectWithValidationFiles(directory: string): string[] {
  const files: string[] = []

  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectWithValidationFiles(fullPath))
      continue
    }

    if (entry.endsWith('WithValidation.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

describe('WithValidation write repository guard', () => {
  it('validation wrappers must not call findByIdForUpdate outside a transaction', () => {
    const validationWrappers = collectWithValidationFiles(useCasesRoot)

    expect(validationWrappers.length).toBeGreaterThan(0)

    const offenders = validationWrappers.filter((filePath) => readFileSync(filePath, 'utf8').includes('findByIdForUpdate'))

    expect(
      offenders,
      'findByIdForUpdate registers optimistic-lock state and requires an active transaction. Use read repositories or lookup services in *WithValidation classes instead.'
    ).toEqual([])
  })
})
