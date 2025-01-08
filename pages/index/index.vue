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
		
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				isPlaying: false,
				progress: 0,
				latitude: 39.909,
				longitude: 116.397,
				markers: [{
					id: 1,
					latitude: 39.909,
					longitude: 116.397,
					title: '当前位置'
				}],
				searchKeyword: '',
			}
		},
		onLoad() {
			// 获取用户位置
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					this.latitude = res.latitude
					this.longitude = res.longitude
					this.markers[0].latitude = res.latitude
					this.markers[0].longitude = res.longitude
				}
			})
		},
		methods: {
			
			handleSearch() {
				if (!this.searchKeyword.trim()) {
					uni.showToast({
						title: '请输入搜索关键词',
						icon: 'none'
					});
					return;
				}
				
				// 跳转到搜索结果页面
				uni.navigateTo({
					url: `/pages/search/index?keyword=${encodeURIComponent(this.searchKeyword)}`
				});
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
		background: #007AFF;
		color: #fff;
		border-radius: 40rpx;
		font-size: 28rpx;
		padding: 0 30rpx;
		margin-left: 20rpx;
	}
</style>
