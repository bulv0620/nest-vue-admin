import { Resource } from 'src/modules/resource/entities/resource.entity'

// 资源生成树结构
export function buildResourceTree(resources: Resource[]): Resource[] {
  const resourceMap = new Map<number, Resource>()
  const resourceTree: Resource[] = []

  resources = resources.sort((a, b) => a.order - b.order)

  resources.forEach((resource) => {
    resource.children = []
    resourceMap.set(resource.id, resource)
  })

  resources.forEach((resource) => {
    const parentId = resource.parent ? resource.parent.id : null

    if (parentId !== null && resourceMap.has(parentId)) {
      resourceMap.get(parentId).children.push(resource)
    } else {
      resourceTree.push(resource)
    }
  })

  return resourceTree
}
