import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ICustomHttpExceptionResponse, IHttpExceptionResponse } from './exception.interface'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: HttpException, host: ArgumentsHost): void {
    this.sendResponse(host, exception)
  }

  private sendResponse = (host: ArgumentsHost, exception: Error): void => {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status: HttpStatus
    let error: string | Error | unknown
    let message: string

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const errorResponse = exception.getResponse()
      error = (errorResponse as IHttpExceptionResponse).error || exception.cause
      message = (errorResponse as IHttpExceptionResponse).message || exception.message
      // } else if (exception instanceof AxiosError) {
      //   status = HttpStatus.BAD_REQUEST
      //   error = exception.name + ` ${JSON.stringify(exception.response.data)}`
      //   message = exception.message
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      error = 'Critical internal error.'
      message = 'Unexpected error.'
    }

    const errorResponse = this.getErrorResponse(status, error, message, request)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) this.getErrorLog(errorResponse, request, exception)
    response.status(status).json(errorResponse)
  }

  private getErrorResponse = (
    status: HttpStatus,
    error: string | Error | unknown,
    message: string,
    request: Request,
  ): ICustomHttpExceptionResponse => ({
    statusCode: status,
    error,
    message,
    path: request.url,
    method: request.method,
    timestamp: new Date(),
  })

  private getErrorLog = (
    errorResponse: ICustomHttpExceptionResponse,
    request: Request,
    exception: InternalServerErrorException | Error,
  ): string => {
    const { statusCode } = errorResponse
    const { method, url } = request
    const errorLog = `Response Code: ${statusCode} - Method: ${method} - URL: ${url} - Error: ${JSON.stringify(
      errorResponse,
    )} - Exception: ${exception}`
    this.logger.error(errorLog)

    return errorLog
  }
}
