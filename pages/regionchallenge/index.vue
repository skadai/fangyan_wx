<template>
	<view class="container">
		<view class="search-box">
			<input type="text" placeholder="请输入省份" placeholder-class="placeholder" v-model="searchText" />
		</view>
		<view>
			<province-card
				v-for="(item, index) in filteredProvinceList"
				:key="index"
				:img_src="item.img_src"
				:province="item.province"
				@cardClick="handleCardClick"
			></province-card>
		</view>
	</view>
</template>

<script>
import ProvinceCard from '@/components/ProvinceCard.vue'
import { provinceList } from '@/utils/provinces.js'

export default {
	components: {
		ProvinceCard
	},
	data() {
		return {
			searchText: '',
			provinceList
		}
	},
	computed: {
		filteredProvinceList() {
			if (!this.searchText) {
				return this.provinceList
			}
			return this.provinceList.filter(item => 
				item.province.includes(this.searchText)
			)
		}
	},
	methods: {
		handleCardClick(e) {
			console.log('>>>>> handleCardClick', e)
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20rpx;

	.search-box {
		padding: 20rpx;
		border-radius: 10rpx;
		margin-bottom: 30rpx;
		
		input {
			width: 100%;
			height: 70rpx;
			padding: 0 20rpx;
			background-color: #f5f5f5;
			border-radius: 35rpx;
		}
		
		.placeholder {
			color: #999;
		}
	}
	
	.content {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
}
</style>