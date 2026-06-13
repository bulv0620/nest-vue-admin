import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { Cache } from 'cache-manager'
import { ConfigService } from '@nestjs/config'
import { User } from '../user/entities/user.entity'
import { Resource } from '../resource/entities/resource.entity'
import { buildResourceTree } from 'src/utils/common.utils'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } })

    if (!user) {
      throw new BadRequestException('用户名不存在')
    }

    const isPass = await bcryptjs.compare(password, user.password)
    if (!isPass) {
      throw new BadRequestException('密码错误')
    }

    this.cacheManager.del(`user_detail_${user.id}`)

    return { ...user, password: '_' }
  }

  getToken(user: User) {
    const payload = { ...user }
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_TTL'),
    })
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_TTL'),
      },
    )

    this.cacheManager.set(`refresh_token_${user.id}`, refreshToken, {
      ttl: 60 * 60 * 24 * 30,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshToken(token: string) {
    try {
      const userInfo = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET_KEY'),
      })

      const cacheToken = await this.cacheManager.get(
        `refresh_token_${userInfo.id}`,
      )

      if (!cacheToken) {
        throw new BadRequestException('refresh token过期')
      }

      if (cacheToken !== token.replace('Bearer', '').trim()) {
        throw new BadRequestException('refresh token错误')
      }

      const existUser = await this.findOne(userInfo.id)

      if (!existUser) {
        throw new BadRequestException()
      }

      return this.getToken(existUser)
    } catch (error) {
      console.log(error)
      throw new BadRequestException('refresh token过期')
    }
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({ where: { id } })
  }

  async getUserDetail(id: number) {
    const cachedUserDetail = await this.cacheManager.get(`user_detail_${id}`)

    // 如果存在缓存直接读取缓存
    if (cachedUserDetail) return cachedUserDetail

    const exsitUser = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.resources', 'roles.resources.parent'],
    })

    if (!exsitUser) {
      throw new BadRequestException('用户不存在')
    }

    const result = {
      id: exsitUser.id,
      username: exsitUser.username,
      resources: [],
      email: exsitUser.email,
      isAdmin: exsitUser.isAdmin,
      name: exsitUser.name,
      roles: exsitUser.roles.map((role) => ({ ...role, resources: [] })),
    }

    if (exsitUser.isAdmin) {
      const resources = await this.resourceRepository.find({
        relations: ['parent'],
      })

      result.resources = buildResourceTree(
        resources.filter((resource) => resource.type !== '2'),
      )
    } else {
      const userRoles = exsitUser.roles || []
      const authorizedResources = userRoles.reduce((acc, role) => {
        const roleResources = role.resources || []
        acc.push(...roleResources)
        return acc
      }, [])

      const uniqueAuthorizedResources = authorizedResources.filter(
        (resource, index, self) =>
          index ===
            self.findIndex(
              (r) =>
                r.id === resource.id &&
                r.resourceName === resource.resourceName,
            ) && resource.type !== '2',
      )

      result.resources = buildResourceTree(uniqueAuthorizedResources)
    }

    // 缓存用户信息
    this.cacheManager.set(`user_detail_${id}`, result, {
      ttl: 60 * 60 * 24,
    })

    return result
  }
}
