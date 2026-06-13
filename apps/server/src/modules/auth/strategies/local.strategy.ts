import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { BadRequestException, Injectable } from '@nestjs/common'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super()
  }
  // 要实现的验证函数，固定写法
  async validate(username: string, password: string): Promise<any> {
    // 为了保证我们的策略指责单一，推荐把具体的验证逻辑放到authService中，此处只调用
    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new BadRequestException()
    }
    return this.authService.getToken(user)
  }
}
