<template>
  <view
    class="province-card"
    hover-class="card-hover"
    hover-stay-time="100"
    hover-start-time="20"
    @tap="handleCardClick"
  >
    <!-- 骨架屏 -->
    <view v-if="!isLoaded" class="skeleton">
      <view class="skeleton-content"></view>
    </view>
    <image
      :src="img_src"
      mode="aspectFill"
      class="card-bg"
      :class="{ loaded: isLoaded }"
      @load="handleImageLoad"
    ></image>
    <view class="text-wrapper">
      <text class="province-name">{{ province }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProvinceCard',
  props: {
    img_src: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    location: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isLoaded: false
    }
  },
  methods: {
    handleImageLoad() {
      this.isLoaded = true
    },
    handleCardClick() {
      this.$emit('cardClick', {
        province: this.province,
        latitude: this.location.lat,
        longitude: this.location.lng
      })
    }
  }
}
</script>

<style lang="scss">
.province-card {
  width: 90%;
  height: 200rpx;
  margin: 20rpx auto;
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
  transition: all 0.3s ease;

  .text-wrapper {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.4);
    padding: 10rpx 30rpx;
    border-radius: 10rpx;
    z-index: 10;
  }

  .province-name {
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .skeleton {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    overflow: hidden;
    z-index: 1;

    &-content {
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmer 1.5s infinite;
    }
  }

  .card-bg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 0.3s ease;

    &.loaded {
      opacity: 1;
      z-index: 2;
    }
  }
}

.card-hover {
  transform: scale(1.05) rotate(2deg);
  opacity: 0.9;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.2);
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style> 