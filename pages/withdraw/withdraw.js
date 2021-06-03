// pages/withdraw/withdraw.js
import { 
  apiPrefix,
  report, reportType,
  queryAccountInfo, 
  queryClockInfo,
  saveQrCodeImg,
} from '../../utils/api';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    isChooseImage: false,
    accountInfo: {
      goldCoinCount: 0,
      amount: 0
    },
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息
    clockInTaskList: [{
      day: 1,
      count: 30,
      status: 1
    }, {
      day: 5,
      count: 100,
      status: 0
    }, {
      day: 10,
      count: 500,
      status: 0
    }, {
      day: 20,
      count: 1200,
      status: 0
    }],
    withdrawList: [{
      count: 100,
      status: 0,
    }, {
      count: 200,
      status: 0,
    }, {
      count: 500,
      status: 0,
    }],
    withdrawVisile: false,
    modalType: 0,
    qrCodeUrl: '',
    qrCodeImg: '',
    levelClearCount: 1, // 当日过关关数
    expectedLevel: 10 // 打卡需要完成的关数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const { isChooseImage } = this.data;
    // const openId = wx.getStorageSync('openId');
    // report({
    //   openId,
    //   page: '提现',
    //   type: reportType.page
    // });
    if (!isChooseImage) {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
            selected: 2
        });
      }
      const token = wx.getStorageSync('token');
      if (token) {
         this.getAccountInfo();
         this.getClockInfo();
      } else {
        app.loginCallBack = () => {
          this.getAccountInfo();
          this.getClockInfo();
        }
      }
     
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，
   * 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
   * @param {*} e 
   */
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  /**
   * 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
   * @param {*} e 
   */
  getUserInfo(e) {
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 申请提现
   * @param {*} e 
   */
  applyWithdraw(e) {
    const { item } = e.currentTarget.dataset;
    console.log(item);
    if (item.status !== 1) {
      this.showModal(0);
    }
  },

  /**
   * 显示提现设置弹窗
   */
  openSetModal() {
    this.showModal(1);
  },

  /**
   * 显示弹窗
   */
  showModal(modalType) {
    this.setData({
      withdrawVisile: true,
      modalType,
    });
  },

  /**
   * 关闭弹窗
   */
  closeModal() {
    const { accountInfo: { collectMoneyUrl }, modalType } = this.data;
    this.setData({
      withdrawVisile: false
    });
    if (modalType !== 0) {
      this.setData({
        qrCodeUrl: '',
        qrCodeImg: collectMoneyUrl
      });
    }
  },

  /**
   * 上传二维码图片
   */
  uploadImg() {
    this.setData({
      isChooseImage: true
    });
    wx.chooseImage({
      count: 1,
      success: ({ tempFilePaths }) => {
        console.log(tempFilePaths);
        this.setData({
          modalType: 2,
          qrCodeUrl: tempFilePaths[0],
          qrCodeImg: tempFilePaths[0],
          isChooseImage: false
        });
      },
    })
  },

  /**
   * 常规提现
   * @param {*} e 
   */
  commonWithdraw(e) {
    const { amount } = e.currentTarget.dataset;
    const { amount : userAmount } = this.data.accountInfo;
    wx.showToast({
      title: userAmount > amount ? '今日提现申请名额已满，请明日及时申请' : '现金账户余额不足',
      icon: 'none'
    })
  },

  /**
   * 保存收款二维码
   */
  saveQrCode() {
    const { qrCodeUrl } = this.data;
    if (!qrCodeUrl) {
      return wx.showToast({
        title: '请选择图片',
        icon: 'none'
      })
    }
    wx.showToast({
      title: '上传中...',
      icon: 'loading',
      mask: true,
      duration: 0
    });
    wx.uploadFile({
      url: `${apiPrefix}/api/images/upload`,
      filePath: qrCodeUrl,
      name: 'file',
      header: {
        'X-Token': wx.getStorageSync('token')
      },
      formData: {},
      success: ({ statusCode, data }) => {
        console.log(statusCode, data, JSON.parse(data))
        if (statusCode === 200) {
          this.updateQrcodeImg(JSON.parse(data).data.filePath);
        }
        wx.hideToast();
      },
      fail: (err) => {
        wx.hideToast();
        wx.showToast({
          title: JSON.stringify(err),
          icon: 'error'
        });
      }
    })
  },

  /**
   * 更新收款二维码
   * @param {*} filePath 
   */
  async updateQrcodeImg (filePath) {
    const { accountInfo } = this.data;
    this.setData({
      accountInfo: {
        ...accountInfo,
        collectMoneyUrl: filePath
      }
    });
    const res = await saveQrCodeImg({ filePath });
    if (res) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      this.closeModal();
    }
  },

  /**
   * 获取账号信息
   */
  async getAccountInfo() {
    const res = await queryAccountInfo();
    if (res) {
      this.setData({
        accountInfo: res,
        qrCodeImg: res.collectMoneyUrl
      });
      this.amountAnimate('moneny-count');
      this.amountAnimate('gold-count');
    }
  },

  /**
   * 数额增加动画
   */
  amountAnimate(domId) {
    this.animate(`#${domId}`, [
      { scale: [1] },
      { scale: [1.3] },
      { scale: [1] },
      ], 1000, () => {
        this.clearAnimation(`#${domId}`, () => {
          console.log("清除了#domid上的动画属性")
        })
    });
  },

  /**
   * 获取每日打卡信息
   */
  async getClockInfo() {
    const res = await queryClockInfo();
    if (res) {
      const { levelClearCount, expectedLevel } = res;
      this.setData({
        levelClearCount,
        expectedLevel
      })
    }
  },
})