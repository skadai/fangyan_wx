<template>
  <view class="container">
    <view class="content">
      <view class="title">贡献方言</view>

      <!-- 录音组件 -->
      <view class="record-section">
        <view class="record-controls">
          <button class="record-btn" :class="{ recording: isRecording }" @tap="handleRecordClick">
            {{ isRecording ? '停止录音' : '开始录音' }}
          </button>
          <button v-if="tempFilePath" class="play-btn" @tap="playRecord">试听录音</button>
        </view>
        <text v-if="recordTime" class="record-time">已录制：{{ recordTime }}秒</text>
      </view>

      <!-- 文字输入区域 -->
      <view class="input-section">
        <textarea v-model="formData.text" placeholder="请输入方言文字内容" class="text-input" />
      </view>

      <!-- 地区选择 -->
      <view class="location-section">
        <picker
          mode="multiSelector"
          :range="[provinces, cities]"
          @change="handleRegionChange"
          @columnchange="handleColumnChange"
        >
          <view class="picker-text">
            {{ formData.province || '选择省份' }} - {{ formData.city || '选择城市' }}
          </view>
        </picker>
        <input v-model="formData.county" placeholder="选填：请输入所在县/区" class="county-input" />
      </view>

      <!-- 匿名开关 -->
      <!-- <view class="anonymous-section">
        <text>是否匿名发布</text>
        <switch :checked="formData.isAnonymous" @change="handleAnonymousChange" />
      </view> -->

      <!-- 提交按钮 -->
      <button class="submit-btn" @tap="handleSubmit">提交贡献</button>
    </view>
  </view>
</template>

<script>
import { areaData } from '@/utils/area-data.js' // 假设我们有省市数据
import AudioCc from '@/components/audio-cc/audio-cc.vue'
import { useUserStore } from '@/stores/user'
import { request } from '@/utils/request'

export default {
  components: {
    AudioCc
  },
  data() {
    return {
      formData: {
        text: '',
        province: '',
        city: '',
        isAnonymous: false,
        audioUrl: ''
      },
      provinces: [],
      cities: [],
      provinceIndex: 0,
      // 新增录音相关数据
      isRecording: false,
      recorderManager: null,
      tempFilePath: '',
      recordTime: 0,
      timer: null,
      maxRecordTime: 60 // 添加最大录音时长限制（秒）
    }
  },
  created() {
    // 初始化省份数据
    this.provinces = Object.keys(areaData)
    this.cities = Object.values(areaData)[0] || []
    // 初始化录音管理器
    this.recorderManager = uni.getRecorderManager()
    this.initRecorderListener()
  },
  methods: {
    handleRegionChange(e) {
      const [provinceIndex, cityIndex] = e.detail.value
      this.formData.province = this.provinces[provinceIndex]
      this.formData.city = this.cities[cityIndex]
    },
    handleColumnChange(e) {
      const { column, value } = e.detail
      if (column === 0) {
        // 切换省份时更新城市列表
        this.provinceIndex = value
        this.cities = areaData[this.provinces[value]] || []
      }
    },
    handleAnonymousChange(e) {
      this.formData.isAnonymous = e.detail.value
    },
    initRecorderListener() {
      this.recorderManager.onStart(() => {
        this.isRecording = true
        this.recordTime = 0
        this.timer = setInterval(() => {
          this.recordTime++
          // 达到最大录音时长时自动停止
          if (this.recordTime >= this.maxRecordTime) {
            this.recorderManager.stop()
            uni.showToast({
              title: '已达到最大录音时长',
              icon: 'none'
            })
          }
        }, 1000)
      })

      this.recorderManager.onStop(res => {
        this.isRecording = false
        this.tempFilePath = res.tempFilePath
        clearInterval(this.timer)
      })
    },

    handleRecordClick() {
      if (this.isRecording) {
        this.recorderManager.stop()
      } else {
        this.recorderManager.start({
          format: 'mp3',
          duration: this.maxRecordTime * 1000 // 设置录音最大时长（毫秒）
        })
      }
    },

    playRecord() {
      if (this.tempFilePath) {
        const innerAudioContext = uni.createInnerAudioContext()
        innerAudioContext.src = this.tempFilePath
        innerAudioContext.play()
      }
    },

    async handleSubmit() {
      if (!this.tempFilePath) {
        uni.showToast({
          title: '请先录制音频',
          icon: 'none'
        })
        return
      }

      if (!this.formData.city) {
        uni.showToast({
          title: '请选择所在城市',
          icon: 'none'
        })
        return
      }

      try {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }
        // 生成8位随机字母数字组合
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const uuid =
          Array.from({ length: 8 }, () =>
            characters.charAt(Math.floor(Math.random() * characters.length))
          ).join('') + Date.now().toString()

        // 显示加载提示
        uni.showLoading({
          title: '正在上传音频...'
        })

        // 读取文件为 ArrayBuffer
        const fileData = await new Promise((resolve, reject) => {
          uni.getFileSystemManager().readFile({
            filePath: this.tempFilePath,
            success: res => resolve(res.data),
            fail: err => reject(err)
          })
        })

        // 直接上传二进制数据
        await uni.request({
          url: `https://worker.dialectmap.site/${uuid}.mp3`,
          method: 'PUT',
          data: fileData,
          header: {
            'Content-Type': 'audio/mpeg'
          }
        })

        // 合并表单数据
        const submitData = {
          ...this.formData,
          audio_url: `https://dialect-upload.dialectmap.site/${uuid}.mp3`,
          openid: userStore.openid,
          nickname: userStore.userInfo?.nickName
        }

        // 提交贡献数据
        const response = await request({
          url: '/contribute',
          method: 'POST',
          data: submitData
        })
        console.log('response >>>', response)
        if (response.statusCode === 200) {
          uni.showToast({
            title: '提交成功',
            icon: 'success'
          })
          // 重置表单
          this.resetForm()
        }
      } catch (error) {
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
        console.error('提交失败：', error)
      } finally {
        uni.hideLoading()
      }
    },

    // 添加重置表单的方法
    resetForm() {
      this.formData = {
        text: '',
        province: '',
        city: '',
        county: '',
        isAnonymous: false,
        audioUrl: ''
      }
      this.tempFilePath = ''
      this.recordTime = 0
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.record-section,
.input-section,
.location-section,
.anonymous-section {
  margin-bottom: 20px;
}

.text-input {
  width: 100%;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
}

.picker-text {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.anonymous-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-btn {
  width: 100%;
  background-color: #007aff;
  color: white;
  border-radius: 4px;
  margin-top: 20px;
}

.record-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.record-btn {
  flex: 1;
  background-color: #007aff;
  color: white;
}

.record-btn.recording {
  background-color: #ff3b30;
}

.play-btn {
  flex: 1;
  background-color: #34c759;
  color: white;
}

.record-time {
  display: block;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.county-input {
  margin-top: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input-section {
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
}

.text-input {
  width: 100%;
  box-sizing: border-box;
}

.county-input {
  margin-top: 10px;
}
</style>