export interface IBatchResult {
  batch: number
  success: boolean
  error?: unknown
}

export interface IResponseSyncMovies {
  created: number
  updated: number
  skipped: number
  errors: number
  batchResults: IBatchResult[]
}
