export class CookieMutationError extends Error {
  constructor(message?: string) {
    super(message || "Cookie mutation failed in server context")
    this.name = "CookieMutationError"
  }
}
