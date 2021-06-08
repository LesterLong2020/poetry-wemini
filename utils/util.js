import { loginForToken } from './api';

export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

export const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async ({ code }) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        const res = await loginForToken({ code });
        if (res) {
          Object.entries(res).forEach(([key, val]) => {
            wx.setStorageSync(key, val);
          });
          resolve();
        } else {
          reject('some error');
        }
      },
      fail: err => {
        reject(err);
      }
    })
  })
}
