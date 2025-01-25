<template>
  <view class="container">
    <view class="content">
      <view class="tabs">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['tab-item', currentTab === index ? 'active' : '']"
          @click="handleTabChange(index)"
        >
          {{ tab }}
        </view>
      </view>

      <!-- 用户游戏记录显示 -->
      <view v-if="currentUserRecord" class="user-record">
        <view class="record-text">
          <!-- 你玩了 {{ currentUserRecord.play_count }} 次 -->
          <view class="title-container">
            <text class="title">{{ getUserTitle(currentUserRecord).title }}</text>
            <text class="description">{{ getUserTitle(currentUserRecord).description }}</text>
          </view>
        </view>
        <view class="record-text"
          >最佳排名 {{ currentUserRecord.rank }}/{{ currentUserRecord.total }}</view
        >
      </view>

      <!-- 省份选择器 -->
      <view v-if="currentTab === 1" class="province-selector">
        <picker @change="onProvinceChange" :value="provinceIndex" :range="provinces">
          <view class="picker"> 当前选择：{{ provinces[provinceIndex] }} </view>
        </picker>
      </view>

      <!-- 排行榜表格 -->
      <view class="table">
        <view class="table-header">
          <view class="avatar">头像</view>
          <view class="rank">排名</view>
          <view class="username">用户名</view>
          <view class="score">分数</view>
          <view class="time">用时</view>
          <view class="date">游戏时间</view>
        </view>
        <view class="table-body">
          <view v-for="(item, index) in rankData" :key="index" class="table-row">
            <view class="avatar">
              <image
                class="avatar-img"
                :src="item.avatar_url || '/static/default-avatar.png'"
                mode="aspectFill"
              />
            </view>
            <view :class="['rank', getRankClass(index + 1)]">{{ index + 1 }}</view>
            <view class="username">{{ item.nickname }}</view>
            <view class="score">{{ item.score }}</view>
            <view class="time">{{ item.cost_time ? `${item.cost_time}s` : '-' }}</view>
            <view class="date">{{ item.created_at?.split('T')[0] || '-' }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '@/utils/request.js'
import { useUserStore } from '@/stores/user'
import levels from '@/utils/level.js'

export default {
  data() {
    return {
      tabs: ['计时模式', '省份闯关', '自由模式'],
      tabKeys: ['timer', 'province', 'free'],
      currentTab: 0,
      provinces: ['全部'],
      provinceIndex: 0,
      rankData: [],
      userRecords: [], // 存储用户游戏记录
      currentUserRecord: null, // 当前显示的游戏记录
      levels: [] // 添加这行
    }
  },
  computed: {
    shareTitle() {
      return this.currentUserRecord
        ? `我获得了 「${this.getUserTitle(this.currentUserRecord).title}」称号，敢来挑战一下吗？`
        : '快来挑战方言小游戏吧！'
    }
  },
  methods: {
    async handleTabChange(index) {
      this.currentTab = index
      this.updateCurrentUserRecord()
      await this.fetchRecords(this.tabKeys[index])
    },
    async onProvinceChange(e) {
      this.provinceIndex = e.detail.value
      if (this.provinceIndex === 0) {
        await this.fetchRecords(this.tabKeys[this.currentTab])
      } else {
        await this.fetchRecords(this.tabKeys[this.currentTab], {
          province: this.provinces[this.provinceIndex]
        })
      }
    },
    getRankClass(rank) {
      const rankClasses = {
        1: 'first',
        2: 'second',
        3: 'third'
      }
      return rankClasses[rank] || ''
    },
    async fetchProvinces() {
      try {
        const response = await request({
          url: '/questions/province/settings',
          method: 'GET'
        })
        // 确保返回的是数组数据
        this.provinces = ['全部', ...response.data.map(item => item.province)]
      } catch (error) {
        console.error('获取省份列表失败：', error)
        uni.showToast({
          title: '获取省份列表失败',
          icon: 'none'
        })
      }
    },
    async fetchRecords(mode, extraParams = {}) {
      try {
        const response = await request({
          url: '/records',
          method: 'GET',
          data: {
            mode,
            ...extraParams,
            num: 10
          }
        })

        // 根据不同模式更新对应的数据
        this.rankData = response.data
      } catch (error) {
        console.error('获取排行榜数据失败：', error)
        uni.showToast({
          title: '获取排行榜数据失败',
          icon: 'none'
        })
      }
    },
    getUserTitle(record) {
      if (!record) return { title: '暂无称号', description: '' }

      const { rank, total, play_count } = record

      // 如果总人数小于100，直接根据排名分配
      if (total < 100) {
        if (rank === 1) return this.levels[7]
        if (rank <= 3) return this.levels[6]
        if (rank <= 5) return this.levels[5]
        if (rank <= 10) return this.levels[4]
        if (rank <= 20) return this.levels[3]
        if (rank <= 30) return this.levels[2]
        return this.levels[1]
      }

      // 如果总人数大于100，根据百分比分配
      const percentage = (rank / total) * 100

      if (percentage <= 1) return this.levels[7]
      if (percentage <= 5) return this.levels[6]
      if (percentage <= 10) return this.levels[5]
      if (percentage <= 20) return this.levels[4]
      if (percentage <= 30) return this.levels[3]
      if (percentage <= 50) return this.levels[2]
      return this.levels[1]
    },
    async fetchUserRecords() {
      try {
        const userStore = useUserStore()
        const response = await request({
          url: '/records/user',
          method: 'GET',
          data: {
            openid: userStore.openid
          }
        })
        this.userRecords = response.data
        this.updateCurrentUserRecord()
      } catch (error) {
        console.error('获取用户游戏记录失败：', error)
      }
    },
    updateCurrentUserRecord() {
      const currentMode = this.tabKeys[this.currentTab]
      this.currentUserRecord = this.userRecords.find(record => record.game_mode === currentMode)
    },

    // 添加显示分享提示的方法
    showShareTip() {
      uni.showModal({
        title: '分享到朋友圈',
        content: '点击右上角「...」，选择「分享到朋友圈」即可分享您的称号',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  },
  async onLoad() {
    this.levels = levels
    await this.fetchUserRecords()
    await this.fetchProvinces()
    await this.fetchRecords(this.tabKeys[this.currentTab])
  },
  // 分享到微信好友
  onShareAppMessage(res) {
    return {
      title: this.shareTitle,
      path: '/pages/board/index',
      imageUrl: '/static/logo.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.shareTitle,
      query: '',
      imageUrl: '/static/logo.png'
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  padding: 20rpx;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20rpx;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;

    &.active {
      color: #007aff;
      border-bottom: 4rpx solid #007aff;
    }
  }
}

.province-selector {
  margin: 20rpx 0;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;

  .picker {
    font-size: 28rpx;
  }
}

.table {
  .table-header,
  .table-row {
    display: flex;
    padding: 20rpx 0;
    font-size: 28rpx;
    border-bottom: 1px solid #eee;

    .avatar,
    .rank,
    .username,
    .score,
    .time,
    .date {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar {
      width: 10%;
    }
    .rank {
      width: 10%;
    }
    .username {
      width: 23%;
    }
    .score {
      width: 20%;
    }
    .time {
      width: 18%;
    }
    .date {
      width: 25%;
    }
  }

  .table-header {
    font-weight: bold;
    background-color: #f8f8f8;
  }

  .table-row {
    .rank {
      &.first {
        color: #ff6b00;
        font-weight: bold;
        background-color: #fff7e6;
      }
      &.second {
        color: #666666;
        font-weight: bold;
        background-color: #f5f5f5;
      }
      &.third {
        color: #b87333;
        font-weight: bold;
        background-color: #fff1e6;
      }
    }
  }
}

.avatar-img {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  object-fit: cover;
}

.user-record {
  margin: 20rpx 0;
  padding: 20rpx;
  border-radius: 8rpx;

  .record-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
  }

  .title-container {
    margin-top: 10rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #007aff;
      margin-right: 20rpx;
    }

    .description {
      font-size: 24rpx;
      color: #666;
      font-style: italic;
    }
  }
}
</style>