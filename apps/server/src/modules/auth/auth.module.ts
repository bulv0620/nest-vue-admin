import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { AuthController } from './auth.controller'
import { User } from '../user/entities/user.entity'
import { Resource } from '../resource/entities/resource.entity'
import { Role } from '../role/entities/role.entity'

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Resource, Role]),
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
