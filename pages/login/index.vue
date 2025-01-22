<template>
  <view class="container">
    <!-- 主页面内容 -->
    <view class="main-content">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <view class="title">方言地图</view>
      <view class="subtitle">探索中国方言的独特魅力</view>
    </view>

    <!-- 登录弹窗 -->
    <uni-popup ref="popup" type="bottom">
      <view class="popup-content">
        <view class="popup-title">登录提示</view>
        <view class="popup-text">请设置头像和昵称后继续使用</view>

        <!-- 头像选择按钮 -->
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image
            v-if="tempAvatar"
            :src="tempAvatar"
            class="avatar-preview"
            mode="aspectFill"
          ></image>
          <text v-else>点击选择头像</text>
        </button>

        <!-- 昵称输入框 -->
        <form>
          <view class="nickname-box">
            <input
              type="nickname"
              class="nickname-input"
              placeholder="请输入昵称"
              v-model="tempNickname"
              @blur="onNicknameInput"
            />
          </view>
        </form>

        <button class="login-btn" @click="handleLogin" type="primary">确认登录</button>
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
      userStore: null,
      tempAvatar: '', // 临时存储选择的头像
      tempNickname: '' // 临时存储输入的昵称
    }
  },

  mounted() {
    this.userStore = useUserStore()
    this.showLoginPopup()
  },

  methods: {
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      this.tempAvatar = avatarUrl
      // 可以在这里将头像上传到你的服务器
      console.log('选择的头像地址：', avatarUrl)
    },

    onNicknameInput(e) {
      this.tempNickname = e.detail.value
    },

    async handleLogin() {
      try {
        if (!this.tempAvatar || !this.tempNickname) {
          uni.showToast({
            title: '请选择头像并填写昵称',
            icon: 'none'
          })
          return
        }

        uni.showLoading({ title: '登录中...' })

        // 1. 先进行登录获取 openid
        await this.userStore.login()

        // 2. 上传头像到 R2
        try {
          // 读取文件为 ArrayBuffer
          const fileRes = await new Promise((resolve, reject) => {
            uni.getFileSystemManager().readFile({
              filePath: this.tempAvatar,
              success: res => resolve(res.data),
              fail: err => reject(err)
            })
          })

          const avatarFileName = `${this.userStore.openid}.jpg`

          // 上传到 R2
          await uni.request({
            url: `https://worker.dialectmap.site/${avatarFileName}`,
            method: 'PUT',
            data: fileRes,
            header: {
              'Content-Type': 'image/jpeg'
            }
          })

          // 3. 更新 userStore 中的用户信息
          this.userStore.updateUserInfo({
            avatarUrl: `https://dialect-upload.dialectmap.site/${avatarFileName}`,
            nickName: this.tempNickname
          })

          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })

          this.closePopup()
          uni.switchTab({
            url: '/pages/gameSettings/index'
          })
        } catch (error) {
          console.error('头像上传失败：', error)
          throw new Error('头像上传失败')
        }
      } catch (error) {
        console.error('登录失败：', error)
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
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

.avatar-btn {
  margin: 20rpx auto;
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  border: none;
  line-height: 1;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.nickname-box {
  margin: 30rpx;
  padding: 0 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.nickname-input {
  height: 80rpx;
  width: 100%;
  text-align: center;
}

.login-btn {
  margin-bottom: 20rpx;
}

.cancel-btn {
  color: #666;
  background-color: #f5f5f5;
}
</style> 