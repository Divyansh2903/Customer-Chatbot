import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

// No default Content-Type: axios sets `application/json` for plain-object
// bodies and `multipart/form-data` (with boundary) for FormData automatically.
export const api = axios.create({ baseURL })

/** Pull a human-readable message out of an axios/API error. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    // Server error shape is { error: { message } }; tolerate string/flat too.
    const data = err.response?.data as
      | { error?: { message?: string } | string; message?: string }
      | undefined
    const errField = data?.error
    const nested = typeof errField === 'string' ? errField : errField?.message
    return nested ?? data?.message ?? err.message ?? fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}
