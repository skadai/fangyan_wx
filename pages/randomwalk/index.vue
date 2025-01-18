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
				<view class="audio-controls">
					<button @tap="togglePlay" class="play-btn">
						{{ isPlaying ? '暂停' : '播放' }}
					</button>
					
					<view class="progress-container">
						<!-- 当前时间 -->
						<text class="time">{{ formatTime(currentTime) }}</text>
						
						<!-- 进度条 -->
						<slider 
							class="progress-bar"
							:value="progress"
							@change="onSliderChange"
							@changing="onSliderChanging"
							step="1"
							block-size="12"
						/>
						
						<!-- 总时长 -->
						<text class="time">{{ formatTime(duration) }}</text>
					</view>
				</view>
			</view>
			
			<!-- 城市信息卡片和答案展示 -->
			<view class="card info-card">
				<text class="info-text">{{ selected.city ? `当前选择的城市是  ${selected.city}`: '请点击地图选择位置'}}</text>
				
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
				> {{ showAnswer ? '隐藏文本': '查看文本' }}</button>
			</view>
		</view>
		
		<!-- 结果遮罩层 -->
		<view v-if="showResult" class="result-mask">
			<view class="result-content">
				<view class="result-location">
					方言所在：{{ result.correct }} - 你的猜测：{{ selected.city }}
				</view>
				<view class="result-distance">
					偏差 {{ result.distance }}公里
				</view>
				<view class="result-comment">
					{{ result.comment }}
				</view>
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
				currentSong: {
					src: 'https://pub-5933d092e74a4a95b1e16491c14ffe3f.r2.dev/15F39sp13kt0003',
					title: '未知',
					artist: '未知艺术家'
				},
				question: {
					source_id: null,
					dialects: null,
					madarin: null,
				},
				isPlaying: false,
				showAnswer: true,
				submitLoading: false,
				changeLoading: false,
				showAnswerLoading: false,
				showResult: false,
				result: {
					correct: '',
					distance: 0,
					comment: ''
				},
				currentTime: 0,
				duration: 0,
				progress: 0,
				isSliding: false
			}
		},
		onLoad() {
		    this.resetAudioContext()
			
			this.innerAudioContext = uni.createInnerAudioContext({useWebAudioImplement: false})
			this.innerAudioContext.autoplay = true
			
			this.innerAudioContext.onPlay(() => {
				console.log('音频播放事件触发',innerAudioContext.paused)
				this.isPlaying = true
			})
			
			this.innerAudioContext.onPause(() => {
				console.log('音频暂停事件触发')
				this.isPlaying = false
			})
			
			this.innerAudioContext.onStop(() => {
				console.log('音频停止事件触发')
				this.isPlaying = false
			})
			
			this.innerAudioContext.onEnded(() => {
				console.log('音频自然播放结束事件触发')
				this.isPlaying = false
			})
			
			this.innerAudioContext.onError((res) => {
				console.error('播放错误：', res.errMsg, res.errCode)
				uni.showToast({
					title: '音频加载失败',
					icon: 'none'
				})
				this.isPlaying = false
				this.innerAudioContext.destroy()
			})
			
			this.innerAudioContext.onCanplay(() => {
				this.duration = this.innerAudioContext.duration
				this.audioLoading = false
			})
			
			this.innerAudioContext.onWaiting(() => {
				this.audioLoading = true
				console.log('音频加载中')
			})
			
			// 监听播放进度
			this.innerAudioContext.onTimeUpdate(() => {
				if (!this.isSliding) {
					this.currentTime = this.innerAudioContext.currentTime || 0
					this.duration = this.innerAudioContext.duration || 0
					this.progress = (this.currentTime / this.duration) * 100
				}
			})

			this.fetchQuestions()
		},
		onUnload() {
			// TODO 
			this.resetAudioContext()
		},
		
		methods: {
			resetAudioContext() {
				if (this.innerAudioContext) {
						try {
							this.innerAudioContext.pause();
							this.innerAudioContext.destroy()
							this.innerAudioContext = null
							console.log('reset audio context...')
						} catch (e) {
							//TODO handle the exception
							console.log('reset error', e)
						}
				}
			},	
			
			
			destroyAudioContext() {
				if (this.innerAudioContext) {
					try {
						this.innerAudioContext.pause()
						this.innerAudioContext.destroy()
						this.innerAudioContext = null
					} catch (e) {
						console.error('销毁音频实例失败：', e)
					}
				}
			},
			
			togglePlay() {
				if (!this.innerAudioContext) {
					console.log('音频实例不存在')
					return
				}
				
				if (!this.innerAudioContext.paused) {
					console.log('开始暂停...')
					this.innerAudioContext.pause()
					this.isPlaying = false
					console.log('暂停后状态检查', this.innerAudioContext.paused)
				} else {
					console.log('开始播放...')
					this.isPlaying = true
					const playResult = this.innerAudioContext.play()
					console.log('播放结果', playResult)
					
					
				}
			},
			
			
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
						this.result = {
							correct: res.correct,
							distance: res.distance,
							comment: res.comment
						}
						this.showResult = true
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
						this.showAnswer = true
						if (this.innerAudioContext) {
							this.innerAudioContext.src = this.currentSong.src
						}
						this.showResult = false
						this.selected = {
							city: null,
							latitude: null,
							longitude: null
						}
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
				} finally {
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
			},
			
			// 格式化时间
			formatTime(time) {
				const minutes = Math.floor(time / 60)
				const seconds = Math.floor(time % 60)
				return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
			},
			
			// 进度条改变结束
			onSliderChange(e) {
				const value = e.detail.value
				const targetTime = (value / 100) * this.duration
				this.innerAudioContext.seek(targetTime)
				this.isSliding = false
			},
			
			// 进度条拖动中
			onSliderChanging(e) {
				this.isSliding = true
				const value = e.detail.value
				this.currentTime = (value / 100) * this.duration
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
		position: relative;
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

	.result-mask {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 70vh;
		background: rgba(0, 0, 0, 0.7);
		z-index: 999;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		text-align: center;
	}

	.result-content {
		padding: 40rpx;
	}

	.result-location {
		font-size: 32rpx;
		margin-bottom: 20rpx;
	}

	.result-distance {
		font-size: 28rpx;
		margin-bottom: 20rpx;
	}

	.result-comment {
		font-size: 36rpx;
		color: #FFD700;
	}

	.audio-loading {
		text-align: center;
		padding: 20rpx;
		color: #666;
		font-size: 28rpx;
	}

	.audio-controls {
		display: flex;
		justify-content: between;
		padding: 20rpx;
	}

	.progress-container {
		display: flex;
		align-items: center;
		margin-top: 20rpx;
	}

	.progress-bar {
		flex: 1;
		margin: 0 20rpx;
	}

	.time {
		font-size: 24rpx;
		color: #666;
		min-width: 80rpx;
	}

	.play-btn {
		width: 160rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		background-color: #007AFF;
		color: white;
		border-radius: 30rpx;
		font-size: 28rpx;
		margin: 0 auto;
	}

	/* 进度条样式自定义 */
	.progress-bar {
		margin: 0 20rpx;
	}

	/* 滑块样式 */
	.progress-bar .uni-slider-handle {
		width: 24rpx;
		height: 24rpx;
		background-color: #007AFF;
	}

	/* 已播放部分的进度条颜色 */
	.progress-bar .uni-slider-track {
		background-color: #007AFF;
	}
</style>
