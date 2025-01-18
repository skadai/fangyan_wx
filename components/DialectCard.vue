<template>
  <view class="dialect-card">
    <view class="card-content">
      <text class="text-content" :class="{ 'text-collapsed': !isExpanded }">{{text}}</text>
      <view v-if="needExpand" class="expand-btn" @tap="toggleExpand">
        <text class="expand-text">{{ isExpanded ? '收起' : '展开' }}</text>
      </view>
    </view>
    <view class="card-footer">
      <text class="location">{{province}} · {{city}}</text>
      <text class="author">{{author}}</text>
      <button class="play-btn" @tap="handlePlay">
        <text class="iconfont">{{isPlaying ? '暂停' : '播放'}}</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DialectCard',
  props: {
    src: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    route: {
      type: String,
      default: ''
    },
    isPlaying: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExpanded: false,
      lineHeight: 45,
      maxHeight: 270
    }
  },
  computed: {
    needExpand() {
      // 通过 DOM 获取实际内容高度，判断是否需要展开按钮
      const query = uni.createSelectorQuery().in(this);
      let needExpand = false;
      query.select('.text-content').boundingClientRect(data => {
        if (data && data.height > this.maxHeight) {
          needExpand = true;
        }
      }).exec();
      return needExpand;
    }
  },
  created() {
    
  },
  methods: {
    handlePlay() {
      this.$emit('play', this.src);
    },
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    }
  },
  beforeDestroy() {
    
  }
}
</script>

<style scoped>
.dialect-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.card-content {
  margin: 16rpx 0 24rpx;
  text-align: center;
}

.text-content {
  font-size: 34rpx;
  line-height: 1.5;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.text-collapsed {
  max-height: 270rpx; /* 6行文本的高度 */
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #eee;
}

.location {
  font-size: 28rpx;
  color: #007AFF;
}

.author {
  font-size: 24rpx;
  color: #666;
}

.play-btn {
  background: #007AFF;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  margin: 0;
}

.expand-btn {
  text-align: center;
  margin-top: 10rpx;
}

.expand-text {
  color: #007AFF;
  font-size: 26rpx;
}
</style> 