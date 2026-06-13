import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'
import { User } from 'src/modules/user/entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    } as StrategyOptions)
  }

  async validate(user: User) {
    if (!user.username) {
      throw new UnauthorizedException()
    }

    const existUser = await this.authService.getUserDetail(user.id)
    if (!existUser) {
      throw new UnauthorizedException('token不正确')
    }
    return existUser
  }
}
