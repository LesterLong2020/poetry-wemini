// app.js
import { login } from "./utils/util";

App({
  onLaunch() {
    // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
  },

  async onShow() {
    console.log('显示');
    await login();
    console.log('登录完成');
    this.loginCallBack && this.loginCallBack();
  },

  onHide() {
    console.log('隐藏')
  },

  globalData: {
    userInfo: null
  },
})
