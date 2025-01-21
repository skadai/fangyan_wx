<template>
  <view class="container">
    <!-- 主页面内容 -->
    <view class="main-content">
      <image 
        class="logo" 
        src="/static/logo.png" 
        mode="aspectFit"
      />
      <view class="title">方言地图</view>
      <view class="subtitle">探索中国方言的独特魅力</view>
    </view>

    <!-- 登录弹窗 -->
    <uni-popup ref="popup" type="bottom">
      <view class="popup-content">
        <view class="popup-title">登录提示</view>
        <view class="popup-text">请授权登录后继续使用</view>
        <button class="login-btn" @click="handleLogin" type="primary">
          登录
        </button>
        <button class="cancel-btn" @click="closePopup">取消</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
  data() {
    return {
      popup: null,
      userStore: null
    }
  },

  mounted() {
    this.userStore = useUserStore()
    this.showLoginPopup()
  },

  methods: {
    async handleLogin() {
      try {
        await this.userStore.login()
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        this.closePopup()
        // 替换为重定向到首页或其他目标页面
        uni.switchTab({
          url: '/pages/gameSettings/index'
        })
      } catch (error) {
        uni.showToast({
          title: '登录失败',
          icon: 'error'
        })
      }
    },

    showLoginPopup() {
      this.$refs.popup.open()
    },

    closePopup() {
      this.$refs.popup.close()
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.main-content {
  text-align: center;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 60rpx;
}

.popup-content {
  background-color: #fff;
  padding: 40rpx;
  border-radius: 24rpx 24rpx 0 0;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
}

.popup-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 40rpx;
}

.login-btn {
  margin-bottom: 20rpx;
}

.cancel-btn {
  color: #666;
  background-color: #f5f5f5;
}
</style> 