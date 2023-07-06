export class DuplicateFileError extends Error {}

export class ParentFolderDoesNotExist extends Error {}

export class HttpError extends Error {
  constructor(
    public readonly status_code: number,
    message: string,
  ) {
    super(message);
  }
}
