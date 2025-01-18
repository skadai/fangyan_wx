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
					<view class="picker">
						当前选择：{{ provinces[provinceIndex] }}
					</view>
				</picker>
			</view>

			<!-- 排行榜表格 -->
			<view class="table">
				<view class="table-header">
					<view class="rank">排名</view>
					<view class="username">用户名</view>
					<view class="score">分数</view>
					<view class="time">用时</view>
					<view class="date">游戏时间</view>
				</view>
				<view class="table-body">
					<view 
						v-for="(item, index) in currentRankList" 
						:key="index"
						class="table-row"
					>
						<view :class="['rank', getRankClass(index + 1)]">{{ index + 1 }}</view>
						<view class="username">{{ item.username }}</view>
						<view class="score">{{ item.score }}</view>
						<view class="time">{{ item.time }}s</view>
						<view class="date">{{ item.date }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			tabs: ['计时模式', '省份闯关', '自由模式'],
			currentTab: 0,
			provinces: ['全部', '广东', '四川', '湖南', '江苏', '浙江'],
			provinceIndex: 0,
			mockData: {
				timeMode: [
					{ username: '用户A', score: 95, time: 120, date: '2024-03-18 15:30' },
					{ username: '用户B', score: 88, time: 150, date: '2024-03-18 14:20' },
					{ username: '用户C', score: 85, time: 180, date: '2024-03-18 13:15' },
					{ username: '用户D', score: 80, time: 200, date: '2024-03-18 12:40' },
					{ username: '用户E', score: 75, time: 220, date: '2024-03-18 11:30' },
					{ username: '用户F', score: 73, time: 230, date: '2024-03-18 11:20' },
					{ username: '用户G', score: 70, time: 240, date: '2024-03-18 11:10' },
					{ username: '用户H', score: 68, time: 250, date: '2024-03-18 11:00' },
					{ username: '用户I', score: 65, time: 260, date: '2024-03-18 10:50' },
					{ username: '用户J', score: 60, time: 270, date: '2024-03-18 10:40' },
				],
				provinceMode: {
					'广东': [
						{ username: '用户F', score: 92, time: 130, date: '2024-03-18 15:20' },
						{ username: '用户G', score: 86, time: 160, date: '2024-03-18 14:10' },
						{ username: '用户H', score: 82, time: 170, date: '2024-03-18 13:00' },
						{ username: '用户I', score: 78, time: 180, date: '2024-03-18 12:50' },
						{ username: '用户J', score: 75, time: 190, date: '2024-03-18 11:40' },
						{ username: '用户K', score: 72, time: 200, date: '2024-03-18 10:30' },
						{ username: '用户L', score: 70, time: 210, date: '2024-03-18 09:20' },
						{ username: '用户M', score: 68, time: 220, date: '2024-03-18 08:10' },
						{ username: '用户N', score: 65, time: 230, date: '2024-03-18 07:00' },
						{ username: '用户O', score: 62, time: 240, date: '2024-03-18 06:50' },
					],
					'四川': [
						{ username: '用户P', score: 90, time: 140, date: '2024-03-18 15:10' },
						{ username: '用户Q', score: 84, time: 170, date: '2024-03-18 14:00' },
						// ... 其他省份数据 ...
					],
				},
				freeMode: [
					{ username: '用户R', score: 98, time: 110, date: '2024-03-18 15:40' },
					{ username: '用户S', score: 94, time: 130, date: '2024-03-18 14:30' },
					{ username: '用户T', score: 89, time: 150, date: '2024-03-18 13:20' },
					{ username: '用户U', score: 85, time: 160, date: '2024-03-18 12:10' },
					{ username: '用户V', score: 82, time: 170, date: '2024-03-18 11:00' },
					{ username: '用户W', score: 78, time: 180, date: '2024-03-18 10:50' },
					{ username: '用户X', score: 75, time: 190, date: '2024-03-18 09:40' },
					{ username: '用户Y', score: 72, time: 200, date: '2024-03-18 08:30' },
					{ username: '用户Z', score: 70, time: 210, date: '2024-03-18 07:20' },
					{ username: '用户AA', score: 68, time: 220, date: '2024-03-18 06:10' },
				]
			}
		}
	},
	computed: {
		currentRankList() {
			let list;
			if (this.currentTab === 1) {
				const province = this.provinces[this.provinceIndex]
				list = province === '全部' 
					? Object.values(this.mockData.provinceMode).flat()
					: this.mockData.provinceMode[province] || []
			} else {
				list = this.currentTab === 0 
					? this.mockData.timeMode 
					: this.mockData.freeMode
			}
			
			// 按分数降序排序，分数相同时按用时升序排序
			return list
				.sort((a, b) => {
					if (b.score !== a.score) {
						return b.score - a.score;
					}
					return a.time - b.time;
				})
				.slice(0, 10); // 只返回前10名
		}
	},
	methods: {
		handleTabChange(index) {
			this.currentTab = index
		},
		onProvinceChange(e) {
			this.provinceIndex = e.detail.value
		},
		getRankClass(rank) {
			const rankClasses = {
				1: 'first',
				2: 'second',
				3: 'third'
			}
			return rankClasses[rank] || ''
		}
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
			color: #007AFF;
			border-bottom: 4rpx solid #007AFF;
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
	.table-header, .table-row {
		display: flex;
		padding: 20rpx 0;
		font-size: 28rpx;
		border-bottom: 1px solid #eee;
		
		.rank { width: 12%; }
		.username { width: 25%; }
		.score { width: 20%; }
		.time { width: 18%; }
		.date { width: 25%; }
	}
	
	.table-header {
		font-weight: bold;
		background-color: #f8f8f8;
	}
	
	.table-row {
		.rank {
			&.first {
				color: #FF6B00;
				font-weight: bold;
				background-color: #FFF7E6;
			}
			&.second {
				color: #666666;
				font-weight: bold;
				background-color: #F5F5F5;
			}
			&.third {
				color: #B87333;
				font-weight: bold;
				background-color: #FFF1E6;
			}
		}
	}
}
</style>