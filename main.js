import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
wx.cloud.init({
  env: 'dialect-test-3gt3l3194804abae'
})
Vue.prototype.$cloud = wx.cloud
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus)
  wx.cloud.init({
    env: 'dialect-test-3gt3l3194804abae'
  })
  app.config.globalProperties.$cloud = wx.cloud
  return {
    app
  }
}
// #endif