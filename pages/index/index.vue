<template>
  <view class="container">
    <!-- 搜索部分 -->
    <view class="search-section">
      <view class="search-box">
        <input
          type="text"
          v-model="searchKeyword"
          class="search-input"
          placeholder="请输入搜索关键词"
        />
        <button class="search-btn" @tap="handleSearch">搜索</button>
      </view>
    </view>

    <!-- 方言记录列表 -->
    <scroll-view class="records-list" scroll-y @scrolltolower="loadMore">
      <dialect-card
        v-for="(record, index) in records"
        :key="index"
        :src="record.source_id"
        :text="record.dialects"
        :province="record.province"
        :city="record.city"
        :author="record.author || '未知'"
        :route="currentRoute"
        :isPlaying="currentPlayingSrc === record.source_id"
        @play="handleAudioPlay"
      />
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="records.length === 0 && !loading" class="empty-tip"> 暂无相关方言记录 </view>
    </scroll-view>
  </view>
</template>

<script>
import DialectCard from '@/components/DialectCard.vue'
import { request } from '@/utils/request'

export default {
  components: {
    DialectCard
  },
  data() {
    return {
      title: 'Hello',
      isPlaying: false,
      progress: 0,
      latitude: 39.909,
      longitude: 116.397,
      markers: [
        {
          id: 1,
          latitude: 39.909,
          longitude: 116.397,
          title: '当前位置'
        }
      ],
      searchKeyword: '',
      records: [],
      pageSize: 8,
      loading: false,
      currentRoute: '',
      audioContext: null,
      currentPlayingSrc: ''
    }
  },
  created() {
    this.initAudioContext()
  },
  async onLoad() {
    // 获取当前路由
    this.currentRoute = this.$route?.path || ''

    // // 获取用户位置
    // uni.getLocation({
    //   type: 'gcj02',
    //   success: res => {
    //     this.latitude = res.latitude
    //     this.longitude = res.longitude
    //     this.markers[0].latitude = res.latitude
    //     this.markers[0].longitude = res.longitude
    //   }
    // })
    await this.handleSearch()
  },
  onUnload() {
    this.destroyAudioContext()
  },
  methods: {
    destroyAudioContext() {
      if (this.audioContext) {
        try {
          this.audioContext.stop()
          this.audioContext.destroy()
        } catch (e) {
          console.error('销毁音频实例失败：', e)
        }
        this.audioContext = null
      }
    },
    initAudioContext() {
      this.audioContext = uni.createInnerAudioContext({ useWebAudioImplement: false })
      this.audioContext.autoplay = true
      this.audioContext.onPlay(() => {
        console.log('音频播放事件触发')
      })

      this.audioContext.onPause(() => {
        console.log('音频暂停事件触发')
        this.currentPlayingSrc = ''
      })

      this.audioContext.onStop(() => {
        console.log('音频停止事件触发')
        this.currentPlayingSrc = ''
      })

      this.audioContext.onEnded(() => {
        console.log('音频自然播放结束事件触发')
        this.currentPlayingSrc = ''
      })

      this.audioContext.onError(res => {
        console.error('播放错误：', res.errMsg, res.errCode)
        uni.showToast({
          title: '音频加载失败',
          icon: 'none'
        })
        this.currentPlayingSrc = ''
      })
    },
    handleAudioPlay(src) {
      if (!this.audioContext) {
        console.log('音频实例不存在')
        return
      }

      if (this.currentPlayingSrc === src) {
        // 暂停当前播放
        if (this.audioContext && !this.audioContext.paused) {
          console.log('开始暂停...')
          this.audioContext.stop()
          this.currentPlayingSrc = ''
          console.log('暂停后状态检查', this.audioContext.paused)
        }
      } else {
        // 播放新的音频
        console.log('开始播放新音频...')
        this.audioContext.src = `${import.meta.env.VITE_MEDIA_URL}/${src}`
        this.currentPlayingSrc = src
        const playResult = this.audioContext.play()
        console.log('播放结果', playResult)
      }
    },

    async handleSearch() {
      this.records = []
      await this.fetchRecords()
    },

    async fetchRecords() {
      if (this.loading) return

      this.loading = true
      try {
        const response = await request({
          url: '/search',
          method: 'POST',
          data: {
            keyword: this.searchKeyword,
            page: 1,
            pageSize: this.pageSize
          }
        })

        this.records = response.data
      } catch (error) {
        console.log('search error', error)
        uni.showToast({
          title: '搜索失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    loadMore() {
      if (this.hasMore) {
        this.fetchRecords()
      }
    }
  },
  beforeDestroy() {
    if (this.audioContext) {
      this.audioContext.destroy()
    }
  }
}
</script>

<style>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.player-section {
  padding: 20rpx;
  background: #fff;
}

.player-card {
  background: #f8f8f8;
  border-radius: 20rpx;
  padding: 20rpx;
}

.cover-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  margin: 0 auto;
  display: block;
}

.player-info {
  text-align: center;
  margin: 20rpx 0;
}

.song-title {
  font-size: 32rpx;
  font-weight: bold;
}

.artist {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

.player-controls {
  margin-top: 20rpx;
}

.progress-bar {
  margin: 20rpx 0;
}

.control-buttons {
  display: flex;
  justify-content: space-around;
}

.control-buttons button {
  min-width: 160rpx;
  font-size: 28rpx;
}

.map-section {
  flex: 1;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.search-section {
  padding: 30rpx 20rpx;
  background: #fff;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 0 30rpx;
}

.search-input {
  flex: 1;
  height: 80rpx;
  border: 1px solid #eee;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  background: #f5f5f5;
}

.search-btn {
  min-width: 120rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #007aff;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 0 30rpx;
  margin-left: 20rpx;
}

.records-list {
  flex: 1;
  width: 100%;
}

.loading {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>
