export const MaxMessageFileSizeMB = parseFloat(
  process.env.MAX_MESSAGE_FILE_SIZE_MB || "20"
)
export const DocParseBaseURL = process.env.DOC_PARSE_BASE_URL
export const CorsFetchBaseURL = process.env.CORS_FETCH_BASE_URL
export const StripeFee =
  process.env.STRIPE_FEE && parseFloat(process.env.STRIPE_FEE)
export const SearxngBaseURL = process.env.SEARXNG_BASE_URL
