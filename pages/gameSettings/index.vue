<template>
  <view class="container">
    <view class="card-list">
      <!-- 随机漫步卡片 -->
      <view
        class="card"
        @tap="navigateToGame('random')"
        style="background-image: url('https://img.cdn.dialectmap.site/free.png')"
      >
        <view class="card-content">
          <view class="card-title">随机漫步</view>
          <view class="card-desc">自由探索各地区方言</view>
        </view>
      </view>

      <!-- 省份挑战卡片 -->
      <view
        class="card"
        @tap="navigateToGame('province')"
        style="background-image: url('https://img.cdn.dialectmap.site/province.png')"
      >
        <view class="card-content">
          <view class="card-title">地区挑战</view>
          <view class="card-desc">测试你对特定省份方言的认知</view>
        </view>
      </view>

      <!-- 计时游戏卡片 -->
      <view
        class="card"
        @tap="navigateToGame('timer')"
        style="background-image: url('https://img.cdn.dialectmap.site/timer.png')"
      >
        <view class="card-content">
          <view class="card-title">计时游戏</view>
          <view class="card-desc">限时寻找方言目标位置</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    navigateToGame(type) {
      let url = ''
      switch (type) {
        case 'random':
          url = '/pages/game/index?mode=free'
          break
        case 'province':
          url = '/pages/province/index?mode=province'
          break
        case 'timer':
          url = '/pages/game/index?mode=timer'
          break
      }
      uni.navigateTo({
        url
      })
    }
  }
}
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  background-color: #fff9e6;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  width: 100%;
}

.card {
  background-color: #fffdf9;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(200, 180, 150, 0.15);
  border: 1rpx solid rgba(200, 180, 150, 0.2);
  height: 180rpx;
  background-size: cover;
  background-position: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 253, 249, 0.85);
    border-radius: 20rpx;
  }

  &:active {
    transform: scale(0.98);
  }

  .card-image,
  .card-content {
    position: relative;
    z-index: 1;
  }
}

.card-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  margin-right: 30rpx;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.card-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.card-desc {
  font-size: 32rpx;
  color: #666;
}
</style> 