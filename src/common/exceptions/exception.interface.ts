export interface IHttpExceptionResponse {
  statusCode: number
  error: string | Error | unknown
  message: string
}

export interface ICustomHttpExceptionResponse extends IHttpExceptionResponse {
  path: string
  method: string
  timestamp: Date
}
