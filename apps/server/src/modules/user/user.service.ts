import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { BadRequestException } from '@nestjs/common/exceptions'
import { UpdatePwdDto } from './dto/update-pwd.dto'
import * as bcryptjs from 'bcryptjs'
import { RemoveUserDto } from './dto/remove-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import { isBoolean } from 'class-validator'
import { UpdateUserDto } from './dto/update-user.dto'
import { BindRolesToUserDto } from './dto/bind-roles-to-user.dto'
import { User } from './entities/user.entity'
import { buildResourceTree } from 'src/utils/common.utils'
import { Role } from '../role/entities/role.entity'
import { Resource } from '../resource/entities/resource.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    })

    if (existUser) {
      throw new BadRequestException('用户名已存在!')
    }

    const defaultRoles = await this.roleRepository.find({
      where: { isDefault: true },
    })

    const userInstance = this.userRepository.create({
      ...createUserDto,
      roles: defaultRoles,
    })

    await this.userRepository.save(userInstance)

    return
  }

  async updatePassword(user: User, updatePwdDto: UpdatePwdDto) {
    const isPass = await bcryptjs.compare(updatePwdDto.oldPwd, user.password)

    if (!isPass) {
      throw new BadRequestException('旧密码错误')
    }

    await this.userRepository.update(
      { id: user.id },
      {
        password: bcryptjs.hashSync(updatePwdDto.newPwd),
      },
    )

    // 清除用户的refresh token
    this.cacheManager.del(`refresh_token_${user.id}`)
    // 清除用户缓存的个人信息
    this.cacheManager.del(`user_detail_${user.id}`)

    return
  }

  async update(updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository.findOne({
      where: { id: updateUserDto.id },
    })

    if (!userToUpdate) {
      throw new BadRequestException('找不到该用户')
    }

    // 应用更新数据
    userToUpdate.name = updateUserDto.name
    userToUpdate.email = updateUserDto.email
    userToUpdate.isAdmin = updateUserDto.isAdmin

    // 保存更新后的user
    await this.userRepository.save(userToUpdate)

    // 清除用户缓存的个人信息
    this.cacheManager.del(`user_detail_${updateUserDto.id}`)

    return
  }

  async findAll(queryUserDto: QueryUserDto) {
    const { username, isAdmin, name, email } = queryUserDto.queryDetail
    const skip = (queryUserDto.pageNum - 1) * queryUserDto.pageSize

    const queryBuilder = this.userRepository.createQueryBuilder('user')

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      })
    }

    if (name) {
      queryBuilder.andWhere('user.name LIKE :name', {
        name: `%${name}%`,
      })
    }

    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', {
        email: `%${email}%`,
      })
    }

    if (isBoolean(isAdmin)) {
      queryBuilder.andWhere('user.isAdmin = :isAdmin', { isAdmin })
    }

    const [users, totalCount] = await queryBuilder
      .skip(skip)
      .take(queryUserDto.pageSize)
      .orderBy('createTime', 'DESC')
      .getManyAndCount()

    return {
      list: users,
      total: totalCount,
      pageSize: queryUserDto.pageSize,
      pageNum: queryUserDto.pageNum,
    }
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({ where: { id } })
  }

  async remove(removeUserDto: RemoveUserDto) {
    const { ids } = removeUserDto

    // 使用批量删除
    const deleteResult = await this.userRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .whereInIds(ids)
      .execute()

    // 检查删除结果
    if (deleteResult.affected !== ids.length) {
      throw new BadRequestException('一个或多个用户不存在')
    }

    return
  }

  async bindRolesToUser(dto: BindRolesToUserDto) {
    const { userId, roleIds } = dto

    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new BadRequestException('用户不存在')
    }

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    })

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('一个或多个角色不存在')
    }

    user.roles = roles

    await this.userRepository.save(user)

    // 清除用户缓存的个人信息
    this.cacheManager.del(`user_detail_${userId}`)
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
