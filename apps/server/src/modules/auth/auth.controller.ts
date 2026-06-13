import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from '@nestjs/common'
import { NoAuth } from 'src/decorators/no-auth.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '登录接口' })
  @NoAuth()
  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Request() req: any) {
    return req.user
  }

  @ApiOperation({ summary: '更新token接口' })
  @NoAuth()
  @Get('refresh')
  refresh(@Query() query: any) {
    return this.authService.refreshToken(query.refreshToken)
  }

  @ApiOperation({ summary: '获取信息接口' })
  @Get('info')
  @UseInterceptors(ClassSerializerInterceptor)
  getUser(@Request() req: any) {
    return req.user
  }
}
