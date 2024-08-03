export interface PreparedPromoteStagedVersionDTO {
  readonly imageId: string
  readonly stagedVersionId: string
  readonly stagedSourceKey: string
  readonly permanentStorageKey: string
}

export type PromoteStagedVersionCommitOutcome = 'promoted' | 'already-current'

export type PromoteStagedVersionFinalizeOutcome = PromoteStagedVersionCommitOutcome | 'aborted'
