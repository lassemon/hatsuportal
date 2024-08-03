import { isNonStringOrEmpty } from '@hatsuportal/common'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { InvalidTagSlugError } from '../errors/InvalidTagSlugError'

export class TagSlug extends NonEmptyString {
  constructor(raw: string) {
    if (isNonStringOrEmpty(raw)) throw new InvalidTagSlugError(`Value '${raw}' is not a valid basis for a tag slug.`)

    const value = raw
      // ── Step 1: Normalise to decomposed form so é → e + ́
      .normalize('NFKD')
      // ── Step 2: Drop all combining marks (diacritics)
      .replace(/[\u0300-\u036f]/g, '')
      // ── Step 3: Trim whitespace at the edges
      .trim()
      // ── Step 4: Convert to lower‑case
      .toLowerCase()
      // ── Step 5: Remove any char that is not alnum, space or hyphen
      .replace(/[^a-z0-9\s-]/g, '')
      // ── Step 6: Collapse runs of whitespace into a single hyphen
      .replace(/\s+/g, '-')
      // ── Step 7: Collapse duplicate hyphens produced by step 6
      .replace(/-+/g, '-')
      // ── Step 8: Finally, strip leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
    super(value)
  }

  override equals(other: unknown): boolean {
    return other instanceof TagSlug && this.value === other.value
  }

  override toString(): string {
    return this.value
  }
}
