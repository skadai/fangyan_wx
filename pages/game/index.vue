<template>
	<view class="container">
		<!-- 地图部分 -->
		<view class="map-section">
			<map
				class="map"
				:latitude="latitude"
				:longitude="longitude"
				show-location
				:enable-scroll="true"
				:scale="16"
				@tap="onMapTap"
			></map>
		</view>
		
		<!-- 重新组织播放器部分 -->
		<view class="player-section">
			<!-- 音频播放器卡片 -->
			<view class="card player-card">
				<audio 
					:src="currentSong.src" 
					:action="audioAction"
					@play="onPlay"
					@pause="onPause"
					controls
				></audio>
			</view>
			
			<!-- 城市信息卡片和答案展示 -->
			<view class="card info-card">
				<text class="info-text">当前选择的城市是 {{ selected.city }}</text>
				
				<!-- 答案区域 -->
				<view v-if="showAnswer" class="answer-container">
					<scroll-view scroll-y class="answer-text">
						{{ question.mandarin || '暂无文本' }}
					</scroll-view>
				</view>
			</view>
			
			<!-- 按钮组 -->
			<view class="button-group">
				<button 
					class="btn submit-btn" 
					@tap="onSubmitQuestion"
					:loading="submitLoading"
					:disabled="submitLoading"
				>提交</button>
				<button 
					class="btn change-btn" 
					@tap="onChangeQuestion"
					:loading="changeLoading"
					:disabled="changeLoading"
				>换一个</button>
				<button 
					class="btn eye-btn" 
					@tap="toggleAnswer"
					:loading="showAnswerLoading"
					:disabled="showAnswerLoading"
				>查看文本</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { request } from '@/utils/request'
	export default {
		data() {
			return {
				latitude: 39.909,
				longitude: 116.397,
				selected: {
					city: null,
					latitude: null,
					longitude: null
				},
				audioAction: {
					method: 'pause'
				},

				currentSong: {
					src: 'https://pub-5933d092e74a4a95b1e16491c14ffe3f.r2.dev/15F39sp13kt0003',
					title: '未知',
					artist: '未知艺术家'
				},
				isPlaying: false,
				question: {
					source_id: null,
					dialects: null,
					madarin: null,
				},
				showAnswer: false,
				submitLoading: false,
				changeLoading: false,
				showAnswerLoading: false
			}
		},
		onLoad() {
			this.fetchQuestions()
		},
		methods: {
			// 播放事件回调
			async onSubmitQuestion() {
				if (this.submitLoading) return
				this.submitLoading = true
				
				// 如果没有选择位置或没有题目，则提示用户
				if (!this.latitude || !this.longitude || !this.question.source_id) {
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
					console.log('submit question', res)
					if (res) {
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						})
						// 提交成功后可以自动获取下一题
						this.fetchQuestions()
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
			onPlay() {
				this.isPlaying = true
			},
			
			// 暂停事件回调
			onPause() {
				this.isPlaying = false
			},
			
			onMapTap(e) {
				uni.request({
					url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${e.detail.latitude},${e.detail.longitude}&key=${import.meta.env.VITE_TENCENT_MAP_KEY}`,
					success: (res) => {
						if (res.data.status === 0) {
							this.selected = {
								'city': res.data.result.address_component.province + res.data.result.address_component.city,
								'latitude': e.detail.latitude,
								'longitude': e.detail.longitude
							}
						} else {
							console.error('获取地理位置失败：', res.data.message);
						}
					},
					fail: (err) => {
						console.error('请求失败：', err);
					}
				});
			},
			
			// 获取方言问题列表
			async fetchQuestions() {
				try {
					const res = await request({
						url: '/questions',
						method: 'GET'
					})
					
					if (res) {
						this.question = res
						this.currentSong.src = `${import.meta.env.VITE_MEDIA_URL}/${res.source_id}`
						this.showAnswer = false
						this.audioAction.method = 'pause'
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
			}
		},
	}
</script>

<style>
	.container {
		width: 100%;
		height: 100vh;
		position: relative;
	}

	.map-section {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
	}

	.map {
		width: 100%;
		height: 100%;
	}

	.player-section {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		right: 20rpx;
		z-index: 2;
	}

	.card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 12rpx;
		padding: 16rpx 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 20rpx;
	}

	.player-card {
		margin-bottom: 20rpx;
	}

	.info-card {
		text-align: center;
		padding: 24rpx;
	}

	.info-text {
		font-size: 28rpx;
		color: #333;
	}

	.button-group {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
		margin-top: 20rpx;
	}

	.btn {
		flex: 1;
		padding: 20rpx 0;
		border-radius: 8rpx;
		font-size: 28rpx;
		text-align: center;
		border: none;
	}

	.submit-btn {
		background-color: #4CAF50;
		color: white;
	}

	.change-btn {
		background-color: #2196F3;
		color: white;
	}

	.answer-container {
		margin-top: 16rpx;
		border-top: 1px solid #eee;
		padding-top: 16rpx;
	}

	.answer-text {
		max-height: 240rpx;
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}

	.eye-btn {
		background-color: #9E9E9E;
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
		cursor: not-allowed;
	}

	/* loading 状态下的文字颜色调整 */
	.submit-btn[loading] {
		color: rgba(255, 255, 255, 0.8);
	}

	.change-btn[loading] {
		color: rgba(255, 255, 255, 0.8);
	}

	.eye-btn[loading] {
		color: rgba(255, 255, 255, 0.8);
	}
</style>
