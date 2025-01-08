<template>
	<view class="container">
		<view class="content">
			<swiper 
				class="swiper" 
				circular 
				:indicator-dots="true" 
				:autoplay="true" 
				:interval="3000" 
				:duration="500"
			>
				<swiper-item 
					v-for="(province, index) in provinces" 
					:key="index"
					class="swiper-item"
					v-if="provinces && provinces.length"
				>
					<view class="province-card">
						<image 
							class="province-bg" 
							:src="province.image"
							mode="aspectFill"
						/>
						<view class="province-name">
							{{ province.name }}
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script>

export default {
	data() {
		return {
			provinces: []
		}
	},
	async onLoad() {
		console.log('页面加载')
		await this.getProvinces()
	},
	methods: {
		async getProvinces() {
			try {
				const res = await this.$cloud.callFunction({
					name: 'load_province'
				})
				if (res && res.result && res.result.provinces) {
					this.provinces = res.result.provinces
				} else {
					console.error('返回数据格式不正确')
				}
			} catch(e) {
				console.error('获取省份数据失败：', e)
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.content {
	display: flex;
	align-items: center;
	min-height: 100vh;
	padding: 20rpx 0;
}

.swiper {
	width: 100%;
	height: 80vh;
}

.swiper-item {
	padding: 0 20rpx;
	height: 100%;
	box-sizing: border-box;
}

.province-card {
	position: relative;
	height: 100%;
	border-radius: 12rpx;
	overflow: hidden;
	width: 100%;
}

.province-bg {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.province-name {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	left: 0;
	right: 0;
	height: 25%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.2);
	color: #fff;
	font-size: 72rpx;
	font-weight: bold;
	width: 100%;
}
</style>