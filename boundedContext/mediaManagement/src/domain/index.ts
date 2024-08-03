export { Base64Image } from './valueObjects/Base64Image'
export { FileSize } from './valueObjects/FileSize'
export { FileName } from './valueObjects/FileName'
export { MimeType } from './valueObjects/MimeType'
export { ImageId } from './valueObjects/ImageId'
export { ImageCreatorId } from './valueObjects/ImageCreatorId'
export { ImageVersionId } from './valueObjects/ImageVersionId'
export { ImageStorageKey } from './valueObjects/ImageStorageKey'

export { InvalidBase64ImageError } from './errors/InvalidBase64ImageError'
export { InvalidFileSizeError } from './errors/InvalidFileSizeError'
export { InvalidFileNameError } from './errors/InvalidFileNameError'
export { InvalidMimeTypeError } from './errors/InvalidMimeTypeError'
export { InvalidImageCreatorIdError } from './errors/InvalidImageCreatorIdError'
export { InvalidImageIdError } from './errors/InvalidImageIdError'
export { ImageVersionAlreadyExistsError } from './errors/ImageVersionAlreadyExistsError'
export { ImageVersionNotFoundError } from './errors/ImageVersionNotFoundError'
export { ImageVersionBelongsToDifferentImageError } from './errors/ImageVersionBelongsToDifferentImageError'
export { StagedStorageKeyMismatchError } from './errors/StagedStorageKeyMismatchError'
export { StorageKeyOwnerEntityIdMismatchError } from './errors/StorageKeyOwnerEntityIdMismatchError'
export { StorageKeyMimeTypeMismatchError } from './errors/StorageKeyMimeTypeMismatchError'
export { InvalidVersionStateForCurrentUpdateError } from './errors/InvalidVersionStateForCurrentUpdateError'
export { InvalidVersionStateForStagingError } from './errors/InvalidVersionStateForStagingError'
export { VersionStateConflictError } from './errors/VersionStateConflictError'
export { VersionNotStagedError } from './errors/VersionNotStagedError'
export { ImageHasNoCurrentVersionError } from './errors/ImageHasNoCurrentVersionError'
export { PreviousCurrentVersionNotFoundError } from './errors/PreviousCurrentVersionNotFoundError'
export { CurrentVersionNotFoundError } from './errors/CurrentVersionNotFoundError'
export { StagedVersionNotFoundError } from './errors/StagedVersionNotFoundError'
export { CannotReplaceNonStagedVersionError } from './errors/CannotReplaceNonStagedVersionError'
export { VersionIdMustDifferError } from './errors/VersionIdMustDifferError'
export { MultipleCurrentVersionsError } from './errors/MultipleCurrentVersionsError'
export { CurrentVersionPointerInconsistencyError } from './errors/CurrentVersionPointerInconsistencyError'
export { CurrentVersionPointerReferencesMissingVersionError } from './errors/CurrentVersionPointerReferencesMissingVersionError'
export { CurrentVersionPointerInvalidStateError } from './errors/CurrentVersionPointerInvalidStateError'

export { Image, ImageVersion } from './entities/Image'
export { CurrentImage } from './entities/CurrentImage'
export { StagedImage } from './entities/StagedImage'

export type { IImageRepository, StagedImageVersionIdentifier } from './repositories/IImageRepository'

export type { ImageProps, ImageVersionProps } from './entities/Image'
export { ImageLoadResult } from './valueObjects/ImageLoadResult'
export { ImageLoadError } from './errors/ImageLoadError'
export {
  ImageCreatedEvent,
  ImageUpdatedEvent,
  ImageVersionStagedEvent,
  ImageVersionPromotedToCurrentEvent,
  ImageVersionDiscardedEvent,
  ImageDeletedEvent
} from './events/image/ImageEvents'
