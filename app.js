// app.js
import { login, isTokenInvalid } from "./utils/util";

App({
  async onLaunch() {
    // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    const token = wx.getStorageSync('token');
    if (!token) {
      await login();
      this.globalData.launched = true;
      this.globalData.isValid = true;
      this.loginCallBack && this.loginCallBack();
    } else {
      this.globalData.launched = true;
    }
  },

  async onShow() {
    if (this.globalData.launched) {
      const res = await isTokenInvalid();
      if (!res) {
        await login()
      }
      this.globalData.isValid = true;
      this.loginCallBack && this.loginCallBack();
    }
  },

  onHide() {
    console.log('隐藏');
    this.globalData.isValid = false;
  },

  globalData: {
    userInfo: null,
    isValid: false,
    launched: false
  },
})
