import { ref } from 'vue'
import store from '@/store'
import { defineStore } from 'pinia'
import { type RouteRecordRaw } from 'vue-router'
import { constantRoutes, asyncRoutes } from '@/router'
import { flatMultiLevelRoutes } from '@/router/helper'
import routeSettings from '@/config/route'
import { ResourceNode, ResourceType } from '@/api/resource/types/resource'
import { v4 as uuidv4 } from 'uuid'

function convertResourcesToRoutes(resources: ResourceNode[]) {
  const routes: RouteRecordRaw[] = []

  function parseResource(resource: ResourceNode) {
    const route: any = {
      path: resource.path || `/${uuidv4()}`,
      component: null,
      children: resource.type === ResourceType.MENU ? [] : undefined,
      name: resource.resourceName,
      meta: {
        id: resource.id,
        title: resource.title,
        dynamic: true,
        icon: resource.icon,
        keepAlive: true,
      },
    }

    // if (resource.icon.startsWith('El')) {
    //   route.meta.elIcon = resource.icon.substring(3)
    // } else {
    //   route.meta.svgIcon = resource.icon.substring(4)
    // }

    if (resource.children && resource.children.length > 0) {
      route.component = () => import('@/layouts/index.vue')
      route.redirect = `${resource.children[0].path}`

      route.children = resource.children.map((child) => parseResource(child))
    } else {
      route.component = () =>
        import(/* @vite-ignore */ `../../views${resource.component}`)
    }
    return route
  }

  resources.forEach((resource) => {
    const route = parseResource(resource)
    routes.push(route)
  })

  return routes
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])

  const setRoutes = (isAdmin: boolean, resources: ResourceNode[]) => {
    const accessedRoutes = convertResourcesToRoutes(resources).concat(
      routeSettings.async && isAdmin ? asyncRoutes : [],
    )

    routes.value = constantRoutes.concat(accessedRoutes)

    dynamicRoutes.value = routeSettings.thirdLevelRouteCache
      ? flatMultiLevelRoutes(accessedRoutes)
      : accessedRoutes
  }

  return { routes, dynamicRoutes, setRoutes }
})

/** 在 setup 外使用 */
export function usePermissionStoreHook() {
  return usePermissionStore(store)
}
