// YouTube URL validation regex (matches backend)
export const YOUTUBE_URL_REGEX = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+|https?:\/\/youtu\.be\/[\w-]+/

export function isValidYoutubeUrl(url: string): boolean {
  return YOUTUBE_URL_REGEX.test(url)
}

// Parse Rails-style error messages into field-specific errors
export function parseFieldErrors<T extends Record<string, string | undefined>>(
  errors: string[],
  fieldMatchers: Record<keyof T, string[]>
): T {
  const fieldErrors = {} as T

  for (const error of errors) {
    const lowerError = error.toLowerCase()
    let matched = false

    for (const [field, matchers] of Object.entries(fieldMatchers)) {
      if (matchers.some(matcher => lowerError.includes(matcher))) {
        (fieldErrors as Record<string, string>)[field] = error
        matched = true
        break
      }
    }

    if (!matched) {
      fieldErrors.base = fieldErrors.base
        ? `${fieldErrors.base}, ${error}`
        : error
    }
  }

  return fieldErrors
}
