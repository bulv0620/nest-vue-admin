import { BadRequestException, Injectable, Inject } from '@nestjs/common'
import { CreateResourceDto } from './dto/create-resource.dto'
import { UpdateResourceDto } from './dto/update-resource.dto'
import { In, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { RemoveResourceDto } from './dto/remove-resource.dto'
import { QueryResourceDto } from './dto/query-resource.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Resource } from './entities/resource.entity'
import { User } from '../user/entities/user.entity'
import { buildResourceTree } from 'src/utils/common.utils'

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createResourceDto: CreateResourceDto) {
    const exsitResource = await this.resourceRepository
      .createQueryBuilder('resource')
      .where('resource.resourceName = :resourceName OR resource.path = :path', {
        resourceName: createResourceDto.resourceName,
        path: createResourceDto.path,
      })
      .getOne()

    if (exsitResource) {
      throw new BadRequestException('资源已存在')
    }

    const resourceInstance = this.resourceRepository.create({
      ...createResourceDto,
    })

    await this.resourceRepository.save(resourceInstance)

    return
  }

  async findAll(queryResourceDto: QueryResourceDto) {
    const { resourceName, title, path, type } = queryResourceDto

    const queryBuilder = this.resourceRepository.createQueryBuilder('resource')

    if (resourceName) {
      queryBuilder.andWhere('resource.resourceName like :resourceName', {
        resourceName: `%${resourceName}%`,
      })
    }

    if (title) {
      queryBuilder.andWhere('resource.title like :title', {
        title: `%${title}%`,
      })
    }

    if (path) {
      queryBuilder.andWhere('resource.path like :path', {
        path: `%${path}%`,
      })
    }

    if (type) {
      queryBuilder.andWhere('resource.type = :type', {
        type,
      })
    }

    queryBuilder.leftJoinAndSelect('resource.parent', 'parent')

    const resources = await queryBuilder.getMany()

    return buildResourceTree(resources)
  }

  async update(updateResourceDto: UpdateResourceDto) {
    const resourceToUpdate = await this.resourceRepository.findOne({
      where: { id: updateResourceDto.id },
    })

    if (!resourceToUpdate) {
      throw new BadRequestException('资源不存在')
    }

    // 校验资源重复
    const exsitResource = await this.resourceRepository
      .createQueryBuilder('resource')
      .where(
        '(resource.resourceName = :resourceName OR resource.path = :path) and resource.id != :id',
        {
          resourceName: updateResourceDto.resourceName,
          path: updateResourceDto.path,
          id: updateResourceDto.id,
        },
      )
      .getOne()

    if (exsitResource) {
      throw new BadRequestException('资源已存在')
    }

    resourceToUpdate.resourceName = updateResourceDto.resourceName
    resourceToUpdate.title = updateResourceDto.title
    resourceToUpdate.path = updateResourceDto.path
    resourceToUpdate.component = updateResourceDto.component
    resourceToUpdate.icon = updateResourceDto.icon
    resourceToUpdate.parent = updateResourceDto.parent
    resourceToUpdate.order = updateResourceDto.order

    await this.resourceRepository.save(resourceToUpdate)

    // 清除缓存
    const usersWithUpdatedResource = await this.userRepository.find({
      where: {
        roles: { resources: { id: updateResourceDto.id } },
      },
    })

    usersWithUpdatedResource.forEach((user) => {
      this.cacheManager.del(`user_detail_${user.id}`)
    })

    return
  }

  async remove(removeResourceDto: RemoveResourceDto) {
    const { ids } = removeResourceDto

    // 使用批量删除
    const deleteResult = await this.resourceRepository
      .createQueryBuilder()
      .delete()
      .from(Resource)
      .whereInIds(ids)
      .execute()

    // 检查删除结果
    if (deleteResult.affected !== ids.length) {
      throw new BadRequestException('一个或多个资源不存在')
    }

    // 清除缓存
    const usersWithDeletedResources = await this.userRepository.find({
      where: {
        roles: { resources: { id: In(ids) } },
      },
    })

    usersWithDeletedResources.forEach((user) => {
      this.cacheManager.del(`user_detail_${user.id}`)
    })
  }
}
