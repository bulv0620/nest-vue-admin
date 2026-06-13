/** 统一处理 localStorage */

import CacheKey from '@/constants/cache-key'
import { type SidebarOpened, type SidebarClosed } from '@/constants/app-key'
import { type ThemeName } from '@/hooks/useTheme'
import { type TagView } from '@/store/modules/tags-view'
import { type LayoutSettings } from '@/config/layouts'

//#region 系统布局配置
export const getConfigLayout = () => {
  const json = localStorage.getItem(CacheKey.CONFIG_LAYOUT)
  return json ? (JSON.parse(json) as LayoutSettings) : null
}
export const setConfigLayout = (settings: LayoutSettings) => {
  localStorage.setItem(CacheKey.CONFIG_LAYOUT, JSON.stringify(settings))
}
export const removeConfigLayout = () => {
  localStorage.removeItem(CacheKey.CONFIG_LAYOUT)
}
//#endregion

//#region 侧边栏状态
export const getSidebarStatus = () => {
  return localStorage.getItem(CacheKey.SIDEBAR_STATUS)
}
export const setSidebarStatus = (
  sidebarStatus: SidebarOpened | SidebarClosed,
) => {
  localStorage.setItem(CacheKey.SIDEBAR_STATUS, sidebarStatus)
}
//#endregion

//#region 正在应用的主题名称
export const getActiveThemeName = () => {
  return localStorage.getItem(CacheKey.ACTIVE_THEME_NAME) as ThemeName | null
}
export const setActiveThemeName = (themeName: ThemeName) => {
  localStorage.setItem(CacheKey.ACTIVE_THEME_NAME, themeName)
}
//#endregion

//#region 标签栏
export const getVisitedViews = () => {
  const json = localStorage.getItem(CacheKey.VISITED_VIEWS)
  return JSON.parse(json ?? '[]') as TagView[]
}
export const setVisitedViews = (views: TagView[]) => {
  views.forEach((view) => {
    // 删除不必要的属性，防止 JSON.stringify 处理到循环引用
    delete view.matched
    delete view.redirectedFrom
  })
  localStorage.setItem(CacheKey.VISITED_VIEWS, JSON.stringify(views))
}
export const getCachedViews = () => {
  const json = localStorage.getItem(CacheKey.CACHED_VIEWS)
  return JSON.parse(json ?? '[]') as string[]
}
export const setCachedViews = (views: string[]) => {
  localStorage.setItem(CacheKey.CACHED_VIEWS, JSON.stringify(views))
}
//#endregion

//#region access_token
export const getAccessToken = () => {
  return localStorage.getItem(CacheKey.ACCESS_TOKEN)
}
export const setAccessToken = (token: string) => {
  localStorage.setItem(CacheKey.ACCESS_TOKEN, token)
}
//#endregion

//#region refresh_token
export const getRefreshToken = () => {
  return localStorage.getItem(CacheKey.REFRESH_TOKEN)
}
export const setRefreshToken = (token: string) => {
  localStorage.setItem(CacheKey.REFRESH_TOKEN, token)
}
//#endregion
