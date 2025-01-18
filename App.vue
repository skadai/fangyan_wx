<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// #ifdef MP-WEIXIN
			wx.loadFontFace({
				global: true,  // 是否全局生效
				family: 'HWMC',
				source: `url(${import.meta.env.VITE_IMAGE_URL}/hwmc.woff2)`,
				success: function(res) {
					console.log('字体加载成功', res)
				},
				fail: function(res) {
					console.log('字体加载失败', res)
					console.log(res.status) // 查看详细失败原因
				},
				complete: function(res) {
					console.log('字体加载完成', res)
				}
			})
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">


page {
  font-family: 'HWMC', PingFang SC, Microsoft YaHei, sans-serif;

  background-color: #FFF9E6;
  min-height: 100vh;
}
</style>
