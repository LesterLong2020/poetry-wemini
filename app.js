// app.js
import { login, isTokenInvalid } from "./utils/util";

App({
  onLaunch() {
    // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
  },

  async onShow() {
    const res = await isTokenInvalid();
    if (!res) {
      await login();
      this.globalData.isValid = true;
      this.loginCallBack && this.loginCallBack();
    } else {
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
    isValid: false
  },
})
