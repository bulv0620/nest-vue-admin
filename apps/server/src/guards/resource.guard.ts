import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const noAuth = this.reflector.get<boolean>('no-auth', context.getHandler())
    if (noAuth) return true // @NoAuth接口放行

    const everyone = this.reflector.get<boolean>(
      'everyone',
      context.getHandler(),
    )
    if (everyone) return true // @Everyone接口放行

    const { resources, isAdmin } = request.user // 获取已验证的用户对象

    if (isAdmin) return true // 超级管理员放行

    // 从类级别获取资源名称
    const resourceName = this.reflector.get<string>(
      'resource-name',
      context.getClass(),
    )
    if (resourceName) {
      // 如果有资源名，检查该资源是否在用户的资源树中
      if (!this.isResourceAccessible(resources, resourceName)) {
        return false
      }
    }

    const admin = this.reflector.get<boolean>('admin', context.getHandler())
    if (admin && !isAdmin) return false // 非admin无法访问admin资源

    return true
  }

  private isResourceAccessible(
    resources: any[],
    resourceName: string,
  ): boolean {
    for (const resource of resources) {
      if (resource.resourceName === resourceName) {
        return true
      }
      if (resource.children && resource.children.length > 0) {
        if (this.isResourceAccessible(resource.children, resourceName)) {
          return true
        }
      }
    }
    return false
  }
}
