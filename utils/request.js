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
        token: wx.getStorageSync('token') || 'token-'
      },
      ...config,
      success(res) {
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
          resolve(null);
        }
      },
      fail(err) {
        wx.showToast({
          title: JSON.stringify(err),
          icon: 'none'
        });
        resolve(null);
      }
    })
  })
}

export default request;
