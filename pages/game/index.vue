<template>
  <view>
    <view class="container">
      <!-- 播放器部分 -->
      <view class="player-section">
        <view v-if="showTimer" class="timer-display"> 剩余时间：{{ formatRemainingTime() }} </view>
        <!-- 播放控制区域 -->
        <view class="player-controls">
          <!-- 播放按钮 -->
          <view class="play-btn-wrapper">
            <button @tap="togglePlay" class="play-btn">
              {{ isPlaying ? '暂停' : '播放' }}
            </button>
          </view>

          <!-- 进度控制区域 -->
          <view class="progress-container">
            <!-- 当前时间 -->
            <text class="time">{{ formatTime(currentTime) }}</text>

            <!-- 进度条 -->
            <slider
              class="progress-bar"
              :value="progress"
              @change="onSliderChange"
              @changing="onSliderChanging"
              step="1"
              block-size="12"
              activeColor="#007AFF"
              backgroundColor="#DDDDDD"
            />

            <!-- 总时长 -->
            <text class="time">{{ formatTime(duration) }}</text>
          </view>
        </view>

        <!-- 城市信息卡片和答案展示 -->
        <view
          class="card info-card"
          :style="
            backgroundImage
              ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }
              : {}
          "
        >
          <view class="card-content">
            <!-- 答案区域 -->
            <view v-if="showAnswer" class="answer-container">
              <scroll-view scroll-y class="answer-text">
                <text class="text-content">{{ question.mandarin || '暂无文本' }}</text>
              </scroll-view>
            </view>
          </view>
        </view>

        <!-- 按钮组 -->
        <view class="button-group">
          <button
            class="btn submit-btn"
            @tap="onSubmitQuestion"
            :loading="submitLoading"
            :disabled="submitLoading"
          >
            提交
          </button>
          <button
            v-if="mode !== 'province'"
            class="btn change-btn"
            @tap="onChangeQuestion"
            :loading="changeLoading"
            :disabled="changeLoading"
          >
            换一个
          </button>
          <button
            class="btn eye-btn"
            @tap="toggleAnswer"
            :loading="showAnswerLoading"
            :disabled="showAnswerLoading"
          >
            {{ showAnswer ? '隐藏文本' : '查看文本' }}
          </button>
        </view>
      </view>

      <!-- 地图部分 -->
      <view class="map-container">
        <map
          id="myMap"
          class="map"
          :latitude="latitude"
          :longitude="longitude"
          show-location
          :enable-scroll="true"
          :enable-zoom="true"
          :enable-rotate="false"
          style="pointer-events: auto"
          :scale="mode === 'province' ? 7 : 6"
          @regionchange="onRegionChange"
          :markers="markers"
        ></map>
        <!-- 只在省份模式显示状态栏 -->
        <view v-if="mode === 'province'" class="status-bar">
          <text>第{{ currentQuestionNumber }}/{{ totalQuestions }}题</text>
          <text>得分：{{ totalScore }}</text>
        </view>
      </view>

      <!-- 搜索框部分 -->
      <view class="search-container">
        <input
          class="search-input"
          v-model="searchAddress"
          placeholder="输入地址搜索"
          confirm-type="search"
          @confirm="handleSearch"
          type="text"
          style="font-family: 'HWMC', PingFang SC !important"
        />
        <button class="search-btn" size="mini" @tap="handleSearch">搜索</button>
      </view>
    </view>
    <view class="center-pin">
      <image src="/static/logo.png" class="pin-img" />
      <text class="pin-text">{{ selected.city || '请选择位置' }}</text>
    </view>

    <!-- 结果遮罩层 -->
    <view v-if="showResult" class="result-mask">
      <view class="result-content">
        <view class="result-location">
          方言所在：{{ result.correct }} - 你的猜测：{{ selected.city }}
        </view>
        <view class="result-distance"> 偏差 {{ result.distance }}公里 </view>
        <view class="result-comment">
          {{ result.comment }}
        </view>
        <!-- 添加按钮组 -->
        <view class="result-buttons">
          <button class="result-btn next-btn" @tap="closeResult">下一题</button>
          <button class="result-btn end-btn" @tap="endGame">结束游戏</button>
        </view>
      </view>
    </view>

    <!-- 添加游戏结束对话框 -->
    <view v-if="showGameOver" class="game-over-mask">
      <view class="game-over-content">
        <view class="close-btn" @tap="closeGameOver">×</view>
        <view class="game-over-title">游戏结束</view>
        <view class="game-over-stats">
          <text>最终得分：{{ totalScore }}</text>
          <!-- 根据模式显示不同的答题信息 -->
          <text v-if="mode === 'free'">答题数量：{{ currentQuestionNumber - 1 }}</text>
          <text v-else>答题数量：{{ currentQuestionNumber - 1 }}/{{ totalQuestions }}</text>
          <!-- 只在计时模式显示耗时 -->
          <text v-if="mode === 'timer'">总耗时：{{ formatTime(120 - remainingTime) }}</text>
        </view>
        <view class="game-over-buttons">
          <button class="restart-btn" @tap="restartGame">重新开始</button>
          <button class="share-btn" open-type="share">分享给好友</button>
        </view>
        <view class="timeline-wrapper">
          <button class="timeline-btn" @tap="showShareTip">
            <text>分享到朋友圈</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { provinceList } from '@/utils/provinces.js' // 导入省份数据

const userStore = useUserStore()

export default {
  data() {
    return {
      questionList: [],
      currentQuestionIndex: 0,
      searchAddress: '',
      latitude: 39.909,
      longitude: 116.397,
      selected: {
        city: null,
        latitude: null,
        longitude: null
      },
      mapCenter: {
        lat: 39.909,
        lng: 116.397
      },
      currentSong: {
        src: 'https://pub-5933d092e74a4a95b1e16491c14ffe3f.r2.dev/15F39sp13kt0003',
        title: '未知',
        artist: '未知艺术家'
      },
      question: {
        source_id: null,
        dialects: null,
        madarin: null
      },
      isPlaying: false,
      showAnswer: true,
      submitLoading: false,
      changeLoading: false,
      showAnswerLoading: false,
      showResult: false,
      result: {
        correct: '',
        distance: 0,
        comment: ''
      },
      currentTime: 0,
      duration: 0,
      progress: 0,
      isSliding: false,
      mode: 'free',
      timer: null,
      remainingTime: 120,
      showTimer: false,
      markers: [],
      currentQuestionNumber: 1,
      totalQuestions: 6,
      totalScore: 0,
      questionScores: [],
      showGameOver: false,
      gameStartTime: null,
      provinceList, // 直接使用导入的省份数据
      backgroundImage: ''
    }
  },
  async onLoad(options) {
    this.mapCtx = uni.createMapContext('myMap', this)
    console.log('init map ctx')
    // 读取参数
    if (options) {
      this.mode = options.mode || this.mode
      if (options.province) {
        this.province = options.province
        // 查找对应省份的背景图
        const provinceData = this.provinceList.find(p => p.province === this.province)
        if (provinceData) {
          this.backgroundImage = provinceData.img_src // 假设 provinceList 中的图片字段是 image
        }
        await this.fetchQuestionList(this.province)
      }
      if (options.latitude) {
        this.latitude = Number(options.latitude)
        this.mapCenter.lat = this.latitude
      }
      if (options.longitude) {
        this.longitude = Number(options.longitude)
        this.mapCenter.lng = this.longitude
      }
    }

    this.fetchQuestions()

    // 检查是否登录
    if (!userStore.isLoggedIn) {
      this.destroyAudioContext()
      this.stopTimer()
      uni.navigateTo({
        url: '/pages/login/index'
      })
      return
    } else {
      console.log('用户信息:', userStore)
    }

    // 初始化计时器
    if (this.mode === 'timer') {
      this.showTimer = true
      this.startTimer()
    }
  },
  onUnload() {
    // TODO
    this.destroyAudioContext()
    this.stopTimer()
  },

  methods: {
    // 新增方法统一初始化音频
    onRegionChange(e) {
      // e.type = "begin" | "end"
      // 只有在手势结束时再去获取地图中心坐标，避免拖拽或缩放中频繁调用
      if (e.type === 'end') {
        console.log('regionchange', e)

        // 调用 getCenterLocation
        this.mapCtx.getCenterLocation({
          success: res => {
            // 更新 data 中的 mapCenter
            this.mapCenter.lat = res.latitude
            this.mapCenter.lng = res.longitude
            this.getCity(this.mapCenter.lat, this.mapCenter.lng)
          },
          fail: err => {
            console.log('获取中心点坐标失败:', err)
          }
        })
      }
    },
    setupAudioListeners() {
      this.innerAudioContext = uni.createInnerAudioContext({ useWebAudioImplement: true })

      this.innerAudioContext.onPlay(() => {
        console.log('音频播放事件触发', this.innerAudioContext.paused)
        this.isPlaying = true
      })

      this.innerAudioContext.onPause(() => {
        console.log('音频暂停事件触发')
        this.isPlaying = false
      })

      this.innerAudioContext.onStop(() => {
        console.log('音频停止事件触发')
        this.isPlaying = false
      })

      this.innerAudioContext.onEnded(() => {
        console.log('音频自然播放结束事件触发')
        this.isPlaying = false
      })

      this.innerAudioContext.onError(res => {
        console.error('播放错误：', res.errMsg, res.errCode)
        uni.showToast({
          title: '音频加载失败',
          icon: 'none'
        })
        this.isPlaying = false
        this.innerAudioContext.destroy()
      })

      this.innerAudioContext.onCanplay(() => {
        this.duration = this.innerAudioContext.duration
        this.audioLoading = false
      })

      this.innerAudioContext.onWaiting(() => {
        this.audioLoading = true
        console.log('音频加载中')
      })

      // 监听播放进度
      this.innerAudioContext.onTimeUpdate(() => {
        if (!this.isSliding) {
          this.currentTime = this.innerAudioContext.currentTime || 0
          this.duration = this.innerAudioContext.duration || 0
          this.progress = (this.currentTime / this.duration) * 100
        }
      })
    },
    destroyAudioContext() {
      if (this.innerAudioContext) {
        try {
          this.innerAudioContext.stop()
          this.innerAudioContext.destroy()
        } catch (e) {
          console.log('销毁异常:', e)
        }
        this.innerAudioContext = null
      }
    },

    togglePlay() {
      if (!this.innerAudioContext) return

      // 确保由用户手势触发
      if (this.innerAudioContext.paused) {
        this.innerAudioContext.play()
        this.isPlaying = true
      } else {
        this.innerAudioContext.pause()
        this.isPlaying = false
      }
    },

    async onSubmitQuestion() {
      if (this.submitLoading) return
      this.submitLoading = true

      this.selected.latitude = this.mapCenter.lat
      this.selected.longitude = this.mapCenter.lng

      // 如果没有选择位置或没有题目，则提示用户
      if (!this.selected.latitude || !this.selected.longitude || !this.question.source_id) {
        uni.showToast({
          title: '请先在地图上选择位置',
          icon: 'none'
        })
        return
      }

      try {
        const res = await request({
          url: '/questions',
          method: 'POST',
          data: {
            latitude: this.selected.latitude,
            longitude: this.selected.longitude,
            source_id: this.question.source_id
          }
        })

        if (res) {
          // 计算得分
          const score = this.calculateScore(res.distance)
          this.questionScores.push(score)
          this.totalScore = this.questionScores.reduce((a, b) => a + b, 0)

          this.result = {
            correct: res.correct,
            distance: res.distance,
            comment: res.comment,
            score: score // 添加本题得分到结果中
          }
          this.showResult = true

          this.currentQuestionNumber++
        }
      } catch (error) {
        console.error('提交答案失败：', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      } finally {
        this.submitLoading = false
      }
    },

    // 修改计算分数的方法
    calculateScore(distance) {
      if (this.mode === 'province') {
        // 省份模式：更严格的距离要求
        if (distance < 50) return 100
        if (distance < 100) return 70
        if (distance < 200) return 50
        if (distance < 500) return 20
        return 0
      } else {
        // 其他模式：原有的距离要求
        if (distance < 100) return 100
        if (distance < 300) return 70
        if (distance < 500) return 50
        if (distance < 1000) return 20
        return 0
      }
    },

    // 修改重置方法
    resetGame() {
      this.currentQuestionNumber = 1
      this.totalScore = 0
      this.questionScores = []
      this.currentQuestionIndex = 0
      if (this.mode === 'timer') {
        this.remainingTime = 120
      }
    },

    async onChangeQuestion() {
      if (this.changeLoading) return
      this.changeLoading = true

      try {
        await this.fetchQuestions()
      } catch (error) {
        console.error('切换问题失败：', error)
      } finally {
        this.changeLoading = false
      }
    },
    getCity(latitude, longitude) {
      uni.request({
        url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${
          import.meta.env.VITE_TENCENT_MAP_KEY
        }`,
        success: res => {
          if (res.data.status === 0) {
            this.selected = {
              city:
                res.data.result.address_component.province + res.data.result.address_component.city,
              latitude: latitude,
              longitude: longitude
            }
            console.log('selected', res.data.result.address_component)
          } else {
            console.error('获取地理位置失败：', res.data.message)
          }
        },
        fail: err => {
          console.error('请求失败：', err)
        }
      })
    },

    // 获取方言问题列表
    async fetchQuestionList(province) {
      const res = await request({
        url: '/questions/province',
        method: 'GET',
        data: {
          province
        }
      })
      this.questionList = res.source_ids
      this.currentQuestionIndex = 0
    },
    async fetchQuestions() {
      let params = {}
      let url = '/questions'

      // 检查游戏是否应该结束
      if (
        this.mode === 'province' &&
        (this.questionList.length === 0 || this.currentQuestionIndex >= this.totalQuestions)
      ) {
        this.handleGameOver()
        return
      }

      if (this.mode === 'province') {
        // 随机选择一个索引
        const randomIndex = Math.floor(Math.random() * this.questionList.length)
        // 使用 splice 获取并移除选中的 id
        const randomId = this.questionList.splice(randomIndex, 1)[0]

        params = {
          source_id: randomId
        }
        await this.fetchDetailQuestion(url, params)
      } else {
        await this.fetchDetailQuestion(url, params)
      }
    },

    async fetchDetailQuestion(url, params) {
      this.destroyAudioContext()
      this.setupAudioListeners()
      try {
        const res = await request({
          url,
          method: 'GET',
          data: params
        })

        if (res) {
          this.question = res
          this.currentSong.src = `${import.meta.env.VITE_MEDIA_URL}/${res.source_id}`
          this.showAnswer = true
          if (this.innerAudioContext) {
            this.innerAudioContext.src = this.currentSong.src
            // iOS需要用户交互后播放
            const { platform } = uni.getAppBaseInfo()
            if (platform === 'ios') {
              await this.innerAudioContext.play()
              this.innerAudioContext.pause()
            }
          }
          this.showResult = false
          this.selected = {
            city: null,
            latitude: null,
            longitude: null
          }
        } else {
          uni.showToast({
            title: '获取问题失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取问题失败：', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      } finally {
      }
    },

    async toggleAnswer() {
      if (this.showAnswerLoading) return
      this.showAnswerLoading = true

      try {
        // 如果需要异步操作，放在这里
        this.showAnswer = !this.showAnswer
      } finally {
        this.showAnswerLoading = false
      }
    },

    // 格式化时间
    formatTime(time) {
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },

    // 进度条改变结束
    onSliderChange(e) {
      const value = e.detail.value
      const targetTime = (value / 100) * this.duration
      this.innerAudioContext.seek(targetTime)
      this.isSliding = false
    },

    // 进度条拖动中
    onSliderChanging(e) {
      this.isSliding = true
      const value = e.detail.value
      this.currentTime = (value / 100) * this.duration
    },

    async handleSearch() {
      if (!this.searchAddress.trim()) {
        return
      }

      try {
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(
              this.searchAddress
            )}&key=${import.meta.env.VITE_TENCENT_MAP_KEY}`,
            success: resolve,
            fail: reject
          })
        })

        if (res.data && res.data.status === 0 && res.data.result) {
          const { location } = res.data.result
          this.latitude = location.lat
          this.longitude = location.lng
          this.selected = {
            city:
              res.data.result.address_components.province + res.data.result.address_components.city,
            latitude: location.lat,
            longitude: location.lng
          }
          // 更新 markers，只保留当前搜索结果的标记
          this.markers = [
            {
              id: Date.now(),
              latitude: location.lat,
              longitude: location.lng,
              width: 30,
              height: 30,
              callout: {
                content: this.searchAddress,
                color: '#000000',
                fontSize: 14,
                borderRadius: 4,
                padding: 10,
                bgColor: '#ffffff',
                display: 'ALWAYS'
              }
            }
          ]

          uni.showToast({
            title: '位置已更新',
            icon: 'success'
          })
        } else {
          this.markers = [] // 清空 markers
          uni.showToast({
            title: '未找到该地址',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('搜索地址失败:', error)
        this.markers = [] // 清空 markers
        uni.showToast({
          title: '搜索失败',
          icon: 'error'
        })
      }
    },
    async closeResult() {
      this.showResult = false
      await this.fetchQuestions()
    },
    startTimer() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.remainingTime = 120
      this.gameStartTime = Date.now()
      this.timer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
        } else {
          this.handleGameOver() // 时间到，游戏结束
        }
      }, 1000)
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    // 格式化剩余时间
    formatRemainingTime() {
      const minutes = Math.floor(this.remainingTime / 60)
      const seconds = this.remainingTime % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    // 处理游戏结束
    handleGameOver() {
      this.showGameOver = true
      this.stopTimer() // 停止计时器
      // 可以在这里添加其他游戏结束逻辑，比如上传分数等
    },
    // 关闭游戏结束对话框
    closeGameOver() {
      this.showGameOver = false
      uni.navigateBack() // 返回上一页
    },
    // 重新开始游戏
    restartGame() {
      this.resetGame()
      this.showGameOver = false
      if (this.mode === 'timer') {
        this.startTimer()
      }
      this.fetchQuestions()
    },
    // 添加结束游戏方法
    async endGame() {
      const payload = {
        mode: this.mode,
        score: this.totalScore,
        question_count: this.currentQuestionNumber - 1,
        cost_time: this.mode === 'timer' ? 120 - this.remainingTime : null,
        openid: userStore.openid,
        nickname: userStore.userInfo?.nickName,
        detail: this.mode === 'province' ? { province: this.province } : {},
        avatar_url: userStore.userInfo?.avatarUrl
      }

      try {
        await request({
          url: '/records',
          method: 'POST',
          data: payload
        })
      } catch (error) {
        console.error('上传分数失败:', error)
      }

      this.showResult = false
      this.handleGameOver()
    },

    // 分享给好友
    onShareAppMessage() {
      const shareTitle =
        this.mode === 'province'
          ? `我在${this.province}方言挑战中获得了${this.totalScore}分！`
          : `我在方言挑战中获得了${this.totalScore}分！`

      return {
        title: shareTitle,
        path: '/pages/game/index', // 分享后进入的页面
        imageUrl: this.mode === 'province' ? this.backgroundImage : '/static/logo.png' // 分享的图片，建议尺寸 5:4
      }
    },

    // 分享到朋友圈
    onShareTimeline() {
      const shareTitle =
        this.mode === 'province'
          ? `我在${this.province}方言挑战中获得了${this.totalScore}分！`
          : `我在方言挑战中获得了${this.totalScore}分！`

      return {
        title: shareTitle,
        query: '/pages/game/index', // 可以添加参数
        imageUrl: this.mode === 'province' ? this.backgroundImage : '/static/logo.png'
      }
    },

    showShareTip() {
      uni.showModal({
        title: '分享到朋友圈',
        content: '点击右上角「...」，选择「分享到朋友圈」即可分享您的游戏成绩',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  }
}
</script>

<style>
.container {
  height: 100vh;
  position: relative; /* 添加相对定位 */
}

.player-section {
  position: absolute; /* 改为绝对定位 */
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95); /* 添加半透明背景 */
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 100; /* 确保在地图上层 */
}

.map-container {
  position: absolute; /* 改为绝对定位 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh; /* 填满整个视口高度 */
  z-index: 10;
}

.map {
  width: 100%;
  height: 100%;
}

.search-container {
  position: relative; /* 改为相对定位 */
  margin: 20rpx;
  bottom: auto;
}

.player-controls {
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.play-btn-wrapper {
  flex-shrink: 0;
  margin-right: 20rpx;
  margin-top: 10rpx;
}

.play-btn {
  min-width: 120rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-size: 28rpx;
  padding: 0 20rpx;
}

.progress-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.time {
  font-size: 24rpx;
  color: #666;
  margin: 0 10rpx;
}

.progress-bar {
  flex: 1;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

.info-card {
  position: relative;
  padding: 0; /* 移除内边距，由 card-content 提供 */
  overflow: hidden; /* 确保背景图不会溢出圆角 */
  border-radius: 12rpx;
}

.card-content {
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
  padding: 16rpx 24rpx; /* 恢复内边距 */
}

.answer-container {
  margin-top: 16rpx;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 16rpx;
}

.answer-text {
  max-height: 240rpx;
}

.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #333;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 20rpx;
  padding: 0 20rpx;
}

.btn {
  width: 160rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border-radius: 30rpx;
  font-size: 28rpx;
  padding: 0;
  margin: 0;
  color: white;
}

.center-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pin-img {
  width: 100rpx;
  height: 100rpx;
}

.pin-text {
  margin-top: 10rpx;
  padding: 8rpx 16rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  text-align: center;
}

.submit-btn {
  background-color: #4caf50;
}

.change-btn {
  background-color: #2196f3;
}

.eye-btn {
  background-color: #9e9e9e;
}

.eye-btn {
  background-color: #9e9e9e;
  color: white;
}

@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/font_12345678.ttf') format('truetype');
}

.iconfont {
  font-family: 'iconfont';
}

.icon-eye:before {
  content: '\e900';
}

.icon-eye-off:before {
  content: '\e901';
}

/* 禁用状态样式 */
.btn[disabled] {
  opacity: 0.7;
}

/* loading 状态下的文字颜色调整 */
.btn[loading] {
  opacity: 0.8;
}

.result-mask {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

.result-content {
  padding: 40rpx;
  position: relative;
}

.result-location {
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.result-distance {
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.result-comment {
  font-size: 36rpx;
  color: #ffd700;
}

.audio-loading {
  text-align: center;
  padding: 20rpx;
  color: #666;
  font-size: 28rpx;
}

.audio-controls {
  padding: 20rpx;
  background: #fff;
  border-radius: 12rpx;
}

.play-btn-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.play-btn {
  width: 160rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  background-color: #007aff;
  color: white;
  border-radius: 30rpx;
  font-size: 28rpx;
  padding: 0;
  margin: 0;
}

.progress-container {
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.progress-bar {
  flex: 1;
  margin: 0 20rpx;
  width: auto;
}

.time {
  font-size: 24rpx;
  color: #666;
  min-width: 80rpx;
  text-align: center;
}

/* 确保进度条在容器中正确显示 */
:deep(.uni-slider) {
  margin: 0;
  padding: 0;
}

:deep(.uni-slider-handle) {
  width: 24rpx !important;
  height: 24rpx !important;
  background-color: #007aff !important;
  box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.1);
}

:deep(.uni-slider-track) {
  height: 4rpx !important;
}

.search-container {
  position: fixed;
  bottom: 40rpx;
  left: 20rpx;
  right: 20rpx;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 10rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  height: 70rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background: #fff;
  border-radius: 4rpx;
  font-family: 'HWMC', PingFang SC, Microsoft YaHei, sans-serif !important;
}

.search-btn {
  margin-left: 20rpx;
  background: #007aff;
  color: #fff;
  font-family: 'HWMC', PingFang SC, Microsoft YaHei, sans-serif;
}

.map {
  width: 100%;
  height: 100vh;
}

.close-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 40rpx;
  color: #666;
  cursor: pointer;
  z-index: 1;
  border-radius: 50%;
}

.close-btn:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.timer-display {
  background: rgba(255, 255, 255, 0.9);
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  text-align: center;
  margin: 10rpx 20rpx;
}

/* 修改状态栏样式 */
.status-bar {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8rpx;
  font-size: 28rpx;
  color: red;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.status-bar text {
  white-space: nowrap;
}

/* 游戏结束对话框样式 */
.game-over-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.game-over-content {
  background: white;
  border-radius: 12rpx;
  padding: 40rpx;
  width: 80%;
  max-width: 600rpx;
  position: relative;
}

.game-over-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.game-over-stats {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.game-over-stats text {
  font-size: 28rpx;
  color: #333;
}

.game-over-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
  margin-bottom: 20rpx;
}

.restart-btn,
.share-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: white;
}

.restart-btn {
  background: #4caf50;
}

.share-btn {
  background: #2196f3;
}

.timeline-wrapper {
  margin-top: 20rpx;
  padding: 0 20rpx;
}

.timeline-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: white;
  background: #ff9800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

.share-btn::after,
.timeline-btn::after {
  border: none;
}

.result-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 40rpx;
}

.result-btn {
  width: 160rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  border: none;
  color: white;
  padding: 0;
  margin: 0;
}

.next-btn {
  background-color: #4caf50;
}

.end-btn {
  background-color: #ff5252;
}

/* 按钮点击效果 */
.result-btn:active {
  opacity: 0.8;
}
</style>
