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

export default {
  data() {
    return {
      tabs: ['计时模式', '省份闯关', '自由模式'],
      tabKeys: ['timer', 'province', 'free'],
      currentTab: 0,
      provinces: ['全部'],
      provinceIndex: 0,
      rankData: []
    }
  },
  computed: {},
  methods: {
    async handleTabChange(index) {
      this.currentTab = index
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
            ...extraParams
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
    }
  },
  async onLoad() {
    await this.fetchProvinces()
    // 获取完省份列表后，再获取排行榜数据
    await this.fetchRecords(this.tabKeys[this.currentTab])
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
</style>