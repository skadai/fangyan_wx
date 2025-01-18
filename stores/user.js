import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isLoggedIn: false
  }),

  actions: {
    async login() {
      try {
        // 使用 Promise 方式调用
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject
          })
        })
        
        console.log('login res', loginRes)
        
        const userRes = await new Promise((resolve, reject) => {
          uni.getUserInfo({
            provider: 'weixin',
            success: resolve,
            fail: reject
          })
        })
        
        console.log('user res', userRes)
        
        // 更新状态
        this.userInfo = userRes.userInfo
        this.isLoggedIn = true
        
        return userRes
        
      } catch (error) {
        console.error('登录失败:', error)
        throw new Error('登录失败')
      }
    },
    
    logout() {
      this.userInfo = null;
      this.isLoggedIn = false;
    }
  }
}) 