import { login } from './util';

/**
 * 网络请求
 * @param {*} url 
 * @param {*} data 
 * @param {*} method 
 * @param {*} config 
 */
const request = (url, data, method = 'GET', config = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method,
      header: {
        'X-Token': wx.getStorageSync('token')
      },
      ...config,
      success(res) {
        if (res.data.code === 0) {
          resolve(res.data.data || (typeof res.data.data === 'boolean' ? res.data.data : {}));
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
          reject(res.data.message);
        }
      },
      fail(err) {
        wx.showToast({
          title: JSON.stringify(err),
          icon: 'none'
        });
        reject(err);
      },
      complete(res) {
        if (res.data.code === -401) {
          login();
        }
      }
    })
  })
}




export default request;
