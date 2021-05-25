// app.js
import { login } from "./utils/api";

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res)
        // this.login(res.code);
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  onShow() {
    console.log('显示')
  },

  onHide() {
    console.log('隐藏')
  },

  globalData: {
    userInfo: null
  },

  async login(code) {
    const res = await login({ code });
  }
})
