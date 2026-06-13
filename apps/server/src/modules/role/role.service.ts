import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Not, Repository } from 'typeorm'
import { QueryRoleDto } from './dto/query-role.dto'
import { isBoolean } from 'class-validator'
import { UpdateRoleDto } from './dto/update-role.dto'
import { RemoveRoleDto } from './dto/remove-role.dto'
import { BindUsersToRoleDto } from './dto/bind-users-to-role.dto'
import { BindResourcesToRoleDto } from './dto/bind-resources-to-role.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { User } from '../user/entities/user.entity'
import { Resource } from '../resource/entities/resource.entity'
import { Role } from './entities/role.entity'
import { buildResourceTree } from 'src/utils/common.utils'

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const existRole = await this.roleRepository.findOne({
      where: { roleName: createRoleDto.roleName },
    })

    if (existRole) {
      throw new BadRequestException('角色已存在')
    }

    const roleInstance = this.roleRepository.create({ ...createRoleDto })

    await this.roleRepository.save(roleInstance)

    return
  }

  async findAll() {
    return this.roleRepository.find()
  }

  async query(queryRoleDto: QueryRoleDto) {
    const { roleName, description, isDefault } = queryRoleDto.queryDetail
    const skip = (queryRoleDto.pageNum - 1) * queryRoleDto.pageSize

    const queryBuilder = this.roleRepository.createQueryBuilder('role')

    if (roleName) {
      queryBuilder.andWhere('role.roleName LIKE :roleName', {
        roleName: `%${roleName}%`,
      })
    }

    if (description) {
      queryBuilder.andWhere('role.description LIKE :description', {
        description: `%${description}%`,
      })
    }

    if (isBoolean(isDefault)) {
      queryBuilder.andWhere('role.isDefault = :isDefault', { isDefault })
    }

    const [roles, totalCount] = await queryBuilder
      .skip(skip)
      .take(queryRoleDto.pageSize)
      .orderBy('createTime', 'DESC')
      .getManyAndCount()

    return {
      list: roles,
      total: totalCount,
      pageSize: queryRoleDto.pageSize,
      pageNum: queryRoleDto.pageNum,
    }
  }

  findOne() {
    return
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const roleToUpdate = await this.roleRepository.findOne({
      where: { id: updateRoleDto.id },
    })

    if (!roleToUpdate) {
      throw new BadRequestException('角色不存在')
    }

    // 校验roleName重复
    const existRole = await this.roleRepository.findOne({
      where: { roleName: updateRoleDto.roleName, id: Not(updateRoleDto.id) },
    })

    if (existRole) {
      throw new BadRequestException('角色已存在')
    }

    // 应用更新数据
    roleToUpdate.roleName = updateRoleDto.roleName
    roleToUpdate.description = updateRoleDto.description
    roleToUpdate.isDefault = updateRoleDto.isDefault

    // 保存更新后的 Role
    await this.roleRepository.save(roleToUpdate)

    return
  }

  async remove(removeRoleDto: RemoveRoleDto) {
    const { ids } = removeRoleDto

    // 使用批量删除
    const deleteResult = await this.roleRepository
      .createQueryBuilder()
      .delete()
      .from(Role)
      .whereInIds(ids)
      .execute()

    // 检查删除结果
    if (deleteResult.affected !== ids.length) {
      throw new BadRequestException('一个或多个角色不存在')
    }
  }

  async bindUsersToRole(dto: BindUsersToRoleDto) {
    const { roleId, userIds } = dto

    const role = await this.roleRepository.findOne({ where: { id: roleId } })

    if (!role) {
      throw new BadRequestException(`角色不存在`)
    }

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    })

    if (users.length !== userIds.length) {
      throw new BadRequestException('一个或多个用户不存在')
    }

    role.users = users

    await this.roleRepository.save(role)
  }

  async bindResourcesToRole(dto: BindResourcesToRoleDto) {
    const { roleId, resourceIds } = dto

    const role = await this.roleRepository.findOne({ where: { id: roleId } })

    if (!role) {
      throw new BadRequestException(`角色不存在`)
    }

    const resources = await this.resourceRepository.find({
      where: { id: In(resourceIds) },
    })

    if (resources.length !== resourceIds.length) {
      throw new BadRequestException('一个或多个用户不存在')
    }

    role.resources = resources

    await this.roleRepository.save(role)

    const usersWithCurrentRole = await this.userRepository.find({
      where: {
        roles: { id: roleId },
      },
    })

    usersWithCurrentRole.forEach((user) => {
      this.cacheManager.del(`user_detail_${user.id}`)
    })
  }

  async findResources(id: number) {
    const roleResources = await this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.parent', 'parent')
      .innerJoin('resource.roles', 'role')
      .where('role.id = :id', { id })
      .getMany()

    const allResources = await this.resourceRepository.find({
      relations: ['parent'],
      order: { order: 'ASC' },
    })

    allResources.forEach((resource) => {
      resource.available = roleResources.some(
        (roleResource) => roleResource.id === resource.id,
      )
    })

    return buildResourceTree(
      allResources.filter((resource) => resource.type !== '2'),
    )
  }
}
