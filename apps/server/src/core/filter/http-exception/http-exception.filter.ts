import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = exception.getResponse()
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR // 获取异常状态码

    const errorResponse = {
      data: {},
      message: 'bad request',
      code: status,
    }

    if (typeof response === 'string') {
      errorResponse.message = response
    } else {
      const errorMsg = (response as any).message
      if (errorMsg instanceof Array) {
        errorResponse.data = errorMsg
        errorResponse.message = '格式错误'
      } else {
        errorResponse.message = errorMsg
      }
    }

    ctx.getResponse().header('Content-type', 'application/json; charset=utf-8')
    ctx.getResponse().send(errorResponse)
  }
}
