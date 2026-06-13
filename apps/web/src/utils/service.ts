import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useUserStoreHook } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { get, merge } from 'lodash-es'
import { refreshToken } from '@/api/login'

/** 退出登录并强制刷新页面（会重定向到登录页） */
function logout() {
  useUserStoreHook().logout()
  location.reload()
}

/** 刷新队列 */
interface PendingTask {
  config: AxiosRequestConfig
  resolve: Function
}
let refreshing: boolean = false
const queue: PendingTask[] = []
/** 刷新token并重发请求 */
async function handleRefreshToken(response: any) {
  /** 刷新token请求401则重新登陆 */
  if (response.config.url.includes('/auth/refresh')) {
    return logout()
  }
  try {
    /** 如果已经发起刷新请求,401请求加入等待刷新队列 */
    if (refreshing) {
      return new Promise((resolve) => {
        queue.push({
          config: response.config,
          resolve,
        })
      })
    }

    refreshing = true
    const userStore = useUserStoreHook()
    /** 请求接口 */
    const { data } = await refreshToken(userStore.refreshToken || '')

    /** 更新token */
    userStore.setToken(data.accessToken, data.refreshToken)

    queue.forEach(({ config, resolve }) => {
      /** 重新请求刷新队列的请求 */
      ;(config.headers as any).Authorization = `Bearer ${data.accessToken}`
      resolve(service(config))
    })

    /** 重新请求发起刷新的请求 */
    response.config.headers.Authorization = `Bearer ${data.accessToken}`
    refreshing = false
    return service(response.config)
  } catch (error) {
    /** 刷新token报错则重新登陆 */
    console.error(error)
    return logout()
  }
}

/** 创建请求实例 */
function createService() {
  // 创建一个 axios 实例命名为 service
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    (config) => config,
    // 发送失败
    (error) => Promise.reject(error),
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      // apiData 是 api 返回的数据
      const apiData = response.data
      // 二进制数据则直接返回
      const responseType = response.request?.responseType
      if (responseType === 'blob' || responseType === 'arraybuffer')
        return apiData
      // 这个 code 是和后端约定的业务 code
      const code = apiData.code
      // 如果没有 code, 代表这不是项目后端开发的 api
      if (code === undefined) {
        ElMessage.error('非本系统的接口')
        return Promise.reject(new Error('非本系统的接口'))
      }
      if (code === 200) {
        // 本系统采用 code === 200 来表示没有业务错误
        return apiData
      } else if (code === 401) {
        // Token 过期时
        return handleRefreshToken(response)
      } else {
        // 不是正确的 code
        ElMessage.error(apiData.message || 'Error')
        return Promise.reject(new Error('Error'))
      }
    },
    (error) => {
      // status 是 HTTP 状态码
      const status = get(error, 'response.status')
      switch (status) {
        case 400:
          error.message = '请求错误'
          break
        case 401:
          // Token 过期时
          return handleRefreshToken(error.response)
          break
        case 403:
          error.message = '拒绝访问'
          break
        case 404:
          error.message = '请求地址出错'
          break
        case 408:
          error.message = '请求超时'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        case 501:
          error.message = '服务未实现'
          break
        case 502:
          error.message = '网关错误'
          break
        case 503:
          error.message = '服务不可用'
          break
        case 504:
          error.message = '网关超时'
          break
        case 505:
          error.message = 'HTTP 版本不受支持'
          break
        default:
          break
      }
      ElMessage.error(error.message)
      return Promise.reject(error)
    },
  )
  return service
}

/** 创建请求方法 */
function createRequest(service: AxiosInstance) {
  return function <T>(config: AxiosRequestConfig): Promise<T> {
    const token = useUserStoreHook().accessToken
    const defaultConfig = {
      headers: {
        // 携带 Token
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
      baseURL: import.meta.env.VITE_BASE_API,
      data: {},
    }
    // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
    const mergeConfig = merge(defaultConfig, config)
    return service(mergeConfig)
  }
}

/** 用于网络请求的实例 */
const service = createService()
/** 用于网络请求的方法 */
export const request = createRequest(service)
