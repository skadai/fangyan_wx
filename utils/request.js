const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'https://ai-demo.tool.recurvedata.com/api/dialect' 
  : 'https://your-api-domain.com'  // 这里替换为你的生产环境域名

export const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res)
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        reject(err)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  })
} 