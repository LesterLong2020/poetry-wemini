// pages/withdraw/withdraw.js
import { 
  apiPrefix,
  report, reportType,
  queryAccountInfo, 
  queryClockInfo,
  saveQrCodeImg,
  goldToAmount,
  clockWithdraw,
  queryIsShow,
} from '../../utils/api';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: 0,
    accountInfo: {
      goldCoinCount: 0,
      amount: 0
    },
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息
    clockInTaskList: [],
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
    expectedLevel: 10, // 打卡需要完成的关数
    keepClockDays: 0, // 已连续打卡天数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIsShow();
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
    if (this.getTabBar().data.selected !== 2) {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
            selected: 2
        });
      }
      const token = wx.getStorageSync('token');
      if (token && app.globalData.isValid) {
         this.getAccountInfo();
         this.getClockInfo();
         report({
          page: '提现',
          subType: 'cash_out',
          type: reportType.page
        });
      } else {
        app.loginCallBack = () => {
          this.getAccountInfo();
          this.getClockInfo();
          report({
            page: '提现',
            subType: 'cash_out',
            type: reportType.page
          });
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
  async applyWithdraw(e) {
    const { item: { rewardQuantity, clockInTimes, status } } = e.currentTarget.dataset;
    if (status === 1) {
      try {
        await clockWithdraw({ clockInTimes });
        report({
          subType: 'true_cash_out',
          content: {
            amount: rewardQuantity,
            result: 'success'
          },
          type: reportType.button
        });
        this.showModal(0);
        setTimeout(() => {
          report({
            subType: 'apply_success',
            content:{
              amount: rewardQuantity
            },      
            type: reportType.popup
          });
          this.getClockInfo();
        }, 300)
      } catch (err) {
        console.warn(err);
        if (!this.data.accountInfo.collectMoneyUrl) {
          this.showModal(1);
        }
        report({
          subType: 'true_cash_out',
          content: {
            amount: rewardQuantity,
            result: 'fail'
          },
          type: reportType.button
        });
      }
    } else if (status === 0) {
      wx.showToast({
        title: '打卡天数不足，快去领红包完成打卡吧',
        icon: 'none'
      });
    } else {
      wx.showToast({
        title: '每种金额仅能提现一次，请选择其他金额',
        icon: 'none'
      });
    }
  },

  /**
   * 显示提现设置弹窗
   */
  openSetModal() {
    const { accountInfo: { collectMoneyUrl } } = this.data;
    this.showModal(1);
    report({
      subType: 'cash_out_setup',
      type: reportType.button
    });
    setTimeout(() => {
      report({
        subType: collectMoneyUrl ? 'setup_exist' : 'setup_vacant',   
        type: reportType.popup
      });
    }, 300)
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
    wx.chooseImage({
      count: 1,
      success: ({ tempFilePaths }) => {
        console.log(tempFilePaths);
        this.setData({
          modalType: 2,
          qrCodeUrl: tempFilePaths[0],
          qrCodeImg: tempFilePaths[0]
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
    });
    report({
      subType: 'false_cash_out',
      content: {
        amount: userAmount,
        result:  userAmount > amount ? 'success' : 'fail'
      },
      type: reportType.button
    });
  },

  /**
   * 保存收款二维码
   */
  saveQrCode() {
    const { qrCodeUrl, accountInfo: { collectMoneyUrl } } = this.data;
    if (!qrCodeUrl) {
      if (collectMoneyUrl) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        this.closeModal();
      } else {
        wx.showToast({
          title: '请选择图片',
          icon: 'none'
        })
      }
      return false;
    }
    wx.uploadFile({
      url: `${apiPrefix}/api/images/upload`,
      filePath: qrCodeUrl,
      name: 'file',
      header: {
        'X-Token': wx.getStorageSync('token')
      },
      formData: {},
      success: ({ statusCode, data }) => {
        console.log(statusCode, data, JSON.parse(data));
        if (statusCode === 200) {
          this.updateQrcodeImg(JSON.parse(data).data.filePath);
        }
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
      const { levelClearRedPacketCount, expectedLevel, keepClockDays, clockInRewards } = res;
      this.setData({
        levelClearCount: levelClearRedPacketCount || 0,
        expectedLevel,
        keepClockDays,
        clockInTaskList: clockInRewards
      })
    }
  },

  /**
   * 兑换现金
   */
  exchangeCash() {
    report({
      subType: 'change',
      type: reportType.button
    });
    const { accountInfo: { goldCoinCount } } = this.data;
    if (goldCoinCount < 1000) {
      wx.showToast({
        title: '金币不足1000，无法兑换',
        icon: 'none'
      })
    } else {
      wx.showModal({
        title: '提示',
        content: `可以兑换现金：${(goldCoinCount/100000).toFixed(2)}元`,
        success: async (res) => {
          if (res.confirm) {
            console.log('用户点击确定');
            const res = await goldToAmount();
            if (res) {
              wx.showToast({
                title: '兑换成功！',
                icon: 'success'
              });
              this.getAccountInfo();
            }
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      })
    }
  },

  /**
    * 查询是否显示
    */
   async getIsShow() {
    wx.showLoading();
    const res = await queryIsShow();
    wx.hideLoading();
    this.setData({
      isShow: res ? 1 : 2
    })
  },
})