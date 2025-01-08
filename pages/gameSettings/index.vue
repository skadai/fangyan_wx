<template>
  <view class="container">
    <view class="card-list">
      <!-- 随机漫步卡片 -->
      <view class="card" @tap="navigateToGame('random')">
        <image class="card-image" src="/static/images/random-walk.png"></image>
        <view class="card-content">
          <view class="card-title">随机漫步</view>
          <view class="card-desc">自由探索地图，随机生成目的地</view>
        </view>
      </view>
      
      <!-- 省份挑战卡片 -->
      <view class="card" @tap="navigateToGame('province')">
        <image class="card-image" src="/static/images/province.png"></image>
        <view class="card-content">
          <view class="card-title">省份挑战</view>
          <view class="card-desc">测试你对中国省份的认知</view>
        </view>
      </view>
      
      <!-- 计时游戏卡片 -->
      <view class="card" @tap="navigateToGame('timer')">
        <image class="card-image" src="/static/images/timer.png"></image>
        <view class="card-content">
          <view class="card-title">计时游戏</view>
          <view class="card-desc">限时寻找目标位置</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    navigateToGame(type) {
      let url = '';
      switch(type) {
        case 'random':
          url = '/pages/randomwalk/index';
          break;
        case 'province':
          url = '/pages/regionchallenge/index';
          break;
        case 'timer':
          url = '/pages/timergame/index';
          break;
      }
      uni.navigateTo({
        url
      });
    }
  }
}
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  background-color: #FFF9E6;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 50rpx;
  width: 100%;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  
  &:active {
    transform: scale(0.98);
  }
}

.card-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #666;
}
</style> 