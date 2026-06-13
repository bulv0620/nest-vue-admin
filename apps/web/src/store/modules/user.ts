import { reactive, ref } from 'vue'
import store from '@/store'
import { defineStore } from 'pinia'
import { useTagsViewStore } from './tags-view'
import { useSettingsStore } from './settings'
import { resetRouter } from '@/router'
import { loginApi, getUserInfoApi } from '@/api/login'
import { UserInfo, type LoginRequestData } from '@/api/login/types/login'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/utils/cache/local-storage'

export const useUserStore = defineStore('user', () => {
  const accessToken = ref<string>(getAccessToken() || '')
  const refreshToken = ref<string>(getRefreshToken() || '')
  const userInfo = reactive<UserInfo>({
    username: '',
    resources: [],
    email: '',
    isAdmin: false,
    name: '',
  })

  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** 登录 */
  const login = async ({ username, password, code }: LoginRequestData) => {
    const { data } = await loginApi({ username, password, code })
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
  }
  /** 获取用户详情 */
  const getInfo = async () => {
    const { data } = await getUserInfoApi()
    userInfo.username = data.username
    userInfo.resources = data.resources
    userInfo.email = data.email
    userInfo.isAdmin = data.isAdmin
    userInfo.name = data.name
  }
  /** 登出 */
  const logout = () => {
    setAccessToken('')
    setRefreshToken('')
    resetUserInfo()
    resetRouter()
    _resetTagsView()
  }
  /** 更新token */
  const setToken = (access: string, refresh: string) => {
    setAccessToken(access)
    setRefreshToken(refresh)
    accessToken.value = access
    refreshToken.value = refresh
  }
  /** 重置 Token */
  const resetToken = () => {
    setAccessToken('')
    setRefreshToken('')
    accessToken.value = ''
    refreshToken.value = ''
    resetUserInfo()
  }
  /** 重置userInfo */
  const resetUserInfo = () => {
    userInfo.username = ''
    userInfo.resources = []
    userInfo.email = ''
    userInfo.isAdmin = false
    userInfo.name = ''
  }
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return {
    accessToken,
    refreshToken,
    userInfo,
    login,
    getInfo,
    logout,
    resetToken,
    setToken,
  }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
