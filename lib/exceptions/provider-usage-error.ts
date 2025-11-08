export class ProviderUsageError extends Error {
  constructor(message = "Invalid usage of provider/hook") {
    super(message)
    this.name = "ProviderUsageError"
  }
}

export default ProviderUsageError
