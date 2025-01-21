<template>
  <view
    class="province-card"
    hover-class="card-hover"
    hover-stay-time="100"
    hover-start-time="20"
    @tap="handleCardClick"
  >
    <image :src="img_src" mode="aspectFill" class="card-bg"></image>
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
  methods: {
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

  .card-bg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .text-wrapper {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.4);
    padding: 10rpx 30rpx;
    border-radius: 10rpx;
  }

  .province-name {
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
}

.card-hover {
  transform: scale(1.05) rotate(2deg);
  opacity: 0.9;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.2);
}
</style> 