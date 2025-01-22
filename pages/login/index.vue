<template>
  <view class="container">
    <!-- 主页面内容 -->
    <view class="main-content">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <view class="title">寻迹乡音</view>
      <view class="subtitle">探索中国方言的独特魅力</view>

      <!-- 添加歌谣背景 -->
      <view class="folk-songs-container">
        <view
          v-for="(song, index) in folkSongs"
          :key="index"
          class="folk-song-item"
          :style="song.style"
        >
          {{ song.text }}
        </view>
      </view>
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
          <text v-else>选择头像</text>
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
      tempNickname: '', // 临时存储输入的昵称
      folkSongs: []
    }
  },

  mounted() {
    this.userStore = useUserStore()
    this.showLoginPopup()
    this.initFolkSongs()
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
    },

    initFolkSongs() {
      const songs = [
        '拍大腿，唱山歌，人人说我没老婆。有钱找个娇娇女，没钱找个麻脸婆。麻脸婆，吃又吃得多，拉屎拉成箩，撒尿冲大海，放屁能打陀螺。',
        '天黄黄，地黄黄，我家有个哭夜郎。过路君子念三遍，一觉睡到大天光。',
        '阿里山的姑娘美如水呀，阿里山的少年壮如山。',
        '鸡叫了，天明了。老头起来喂牛了。大牛吃，小牛看。气得老头不吃饭。',
        '胖子很胖，打麻将。欠了钱，不还帐。',
        '要一代没一代，脑袋像个磕烟袋；要一壶没一壶，脑袋像个酱油壶',
        '远处的哈巴尔山口哎，你是多么的陡峭啊！哎，我的千里马'
      ]

      this.folkSongs = songs.map(text => ({
        text,
        style: {
          left: Math.random() * 50 + 'vw', // 随机水平位置
          top: Math.random() * 30 + 'vh', // 随机垂直位置，限制在屏幕高度的 40% 以内
          transform: `rotate(45deg)`, // 统一 45 度旋转
          opacity: 0.1 + Math.random() * 0.3, // 随机透明度
          fontSize: 20 + Math.random() * 30 + 'rpx' // 随机字体大小，范围20-50rpx
        }
      }))
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
  position: relative;
  z-index: 1;
}

.logo {
  width: 400rpx;
  height: 400rpx;
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

.folk-songs-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.folk-song-item {
  position: absolute;
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
  animation: floating 20s linear infinite;
}

@keyframes floating {
  0% {
    transform: translateY(0) rotate(var(--rotation));
  }
  50% {
    transform: translateY(-20rpx) rotate(var(--rotation));
  }
  100% {
    transform: translateY(0) rotate(var(--rotation));
  }
}
</style> 