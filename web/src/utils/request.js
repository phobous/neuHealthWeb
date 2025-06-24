import axios from 'axios'
import {
  getToken
} from '@/utils/auth'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器，自动带token
service.interceptors.request.use(config => {
  if (getToken()) {
    config.headers['Authorization'] = 'Bearer ' + getToken()
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器，直接返回响应数据
service.interceptors.response.use(response => {
  return response.data
}, error => {
  return Promise.reject(error)
})

export default service
