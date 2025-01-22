import { defineStore } from 'pinia'
import { request } from '@/utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: null,
    openid: null,
  }),

  actions: {
    async login() {
      try {
        // 1. 先获取 code
        const loginRes = await uni.login()
        
        // 2. 用 code 从服务器换取 openid
        const openidRes = await request({
          url: '/user/login',
          method: 'POST',
          data: {
            code: loginRes.code
          }
        })
        
        // 3. 保存 openid
        this.openid = openidRes.data.openid
        this.isLoggedIn = true

        
      
        // ... 其他登录逻辑
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },
    
    updateUserInfo(userInfo) {
      this.userInfo = {
        ...this.userInfo,
        ...userInfo
      }
    },
    
    logout() {
      this.userInfo = null;
      this.isLoggedIn = false;
    }
  }
}) 