// pages/task/task.js
import { 
  report, reportType,
  queryAccountInfo,
  queryClockInfo,
  receiveDailyReward,
  receiveRedWall,
  queryRedWallList,
  queryRedWallAmount,
  queryIsShow,
} from '../../utils/api';

const app = getApp();
let videoAd = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: 0, // 0 初始 1 显示 2默认
    accountInfo: {
      goldCoinCount: 0,
      amount: 0
    },
    tabList: ['每日任务', '红包墙'],
    tabIndex: 0,
    taskList: [],
    passCount: 0,
    redEnvelopeInterval: 300,
    redEnvelopeList: [],
    envelopeVisible: false,
    envelopeImgNames: ['tjhb', 'gghb', 'jbhb'],
    redEnvelope: {
      type: 2, // 0 天降红包 1 过关红包 2 金币红包
      amount: 2000
    },
    rewardInfo: {
      rewardId: '',
      redWallIndex: null,
      rewardType: 0 // 0 每日任务奖励 1红包墙奖励
    }
  },

  timer: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIsShow();
    videoAd = wx.createRewardedVideoAd({
      adUnitId: 'adunit-359c0ea9fd8d94d0'
    })
    videoAd.onLoad(() => {
      console.log('加载完毕');
    })
    videoAd.onError((err) => {
      console.log('广告加载错误', err);
    })
    videoAd.onClose((res) => {
      if (res.isEnded) {
        this.receiveEnvelope(true);
        report({
          subType: 'goldcoin_envelop',
          content: {
            result: 'complete'
          },
          type: reportType.incentive
        });
      } else {
        this.receiveEnvelope(false);
        report({
          subType: 'goldcoin_envelop',
          content: {
            result: 'uncomplete'
          },
          type: reportType.incentive
        });
      }
    })
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
          selected: 1
      });
    }
    const token = wx.getStorageSync('token');
    if (token && app.globalData.isValid) {
      this.getAccountInfo();
      this.getTaskList();
      this.getRedWallList();
      report({
        page: '任务',
        subType: 'task',
        type: reportType.page
      });
    } else {
      app.loginCallBack = () => {
        this.getAccountInfo();
        this.getTaskList();
        this.getRedWallList();
        report({
          page: '任务',
          subType: 'task',
          type: reportType.page
        });
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
   * 点击tab
   * @param {*} e 
   */
  tabClick(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      tabIndex: index
    });
  },

  /**
   * 领取任务奖励
   * @param {*} e 
   */
  acceptReward(e) {
    const { rewardId, amount } = e.currentTarget.dataset;
    const { redEnvelope } = this.data;
    this.setData({
      envelopeVisible: true,
      redEnvelope: {
        ...redEnvelope,
        amount
      },
      rewardInfo: {
        type: 0,
        rewardId
      }
    });
    report({
      subType: 'get',
      content: {
        amount
      },
      type: reportType.button
    });
    setTimeout(() => {
      report({
        subType: 'goldcoin_envelop',
        type: reportType.popup
      });
    }, 300)
  },

  /**
   * 初始化红包定时器
   */
  resetInterval() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.checkRedInterval()) {
      this.timer = setInterval(() => {
        if (!this.checkRedInterval()) {
         clearInterval(this.timer);
        }
        const newList = this.data.redEnvelopeList.map(item => {
          let prevTime = item.remainSeconds;
          if (item.remainSeconds > 0) {
            prevTime -= 1;
          }
          return {
            ...item,
            remainSeconds: prevTime,
            timLeftStr: this.formatTime(prevTime)
          }
        });
        this.setData({
          redEnvelopeList: newList
        })
      }, 1000)
    }
  },

  /**
   * 检查是否有需要倒计时的红包
   */
  checkRedInterval() {
    return this.data.redEnvelopeList.some(item => item.remainSeconds > 0);
  },

  /**
   * 格式化时间
   * @param {*} time 
   */
  formatTime(time) {
    let hour = Math.floor(time / (60 * 60));
    let minute = Math.floor((time % (60 * 60)) / 60);
    let second = (time % (60 * 60)) % 60;
    if (hour < 10) {
      hour = `0${hour}`;
    }
    if (minute < 10) {
      minute = `0${minute}`;
    }
    if (second < 10) {
      second = `0${second}`;
    }
    return `${hour}:${minute}:${second}`;
  },

  /**
   * 拆开红包
   * @param {*} e 
   */
  async openRedEnvelope(e) {
    const { index } = e.currentTarget.dataset;
    const { redEnvelope } = this.data;
    const res = await queryRedWallAmount();
    this.setData({
      envelopeVisible: true,
      redEnvelope: {
        ...redEnvelope,
        amount: res || 0
      },
      rewardInfo: {
        type: 1,
        index
      }
    });
    report({
      subType: 'goldcoin_envelop',
      type: reportType.popup
    });
  },

    /**
   * 关闭红包弹窗
   */
  closeEnvelope() {
    wx.showModal({
      title: '提示',
      content: '确认是否关闭？若选择确定关闭，则无法获得奖励',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            envelopeVisible: false
          })
        }
      }
    })
  },
  
  /**
   * 领取红包
   * @param {*} hasAd 
   */
  async receiveEnvelope(finishedAd = false) {
    const { rewardInfo: { type, rewardId, index }, redEnvelope: { amount } } = this.data;
    const param = type === 0 ? { rewardId } : { index, finishedAd, goldCoin: amount };
    const apiFc = type === 0 ? receiveDailyReward : receiveRedWall;
    const res = await apiFc(param);
    if (res) {
      this.getAccountInfo();
    }
    this.setData({
      envelopeVisible: false
    });
    if (type === 0) {
      wx.showToast({
        title: `恭喜您获得${amount}金币，已放入金币账户（可兑换现金）`,
        icon: 'none',
        duration: 2000
      })
      this.getTaskList();
    } else {
      wx.showToast({
        title: `恭喜您获得${this.formatGold(res.totalCoin)}金币，已放入金币账户（可兑换现金）`,
        icon: 'none',
        duration: 2000
      })
      this.getRedWallList();
    }
  },

  /**
   * 格式化金币
   * @param {*} num 
   */
 formatGold (num) {
    return num < 10000 ? num : parseInt(num / 10000) + '万';
  },

  /**
   * 直接收下
   */
  acceptDirect() {
    this.receiveEnvelope(false);
  },

  /**
   * 看视频收下红包
   */
  acceptEnvelope() {
    const { rewardInfo: { type } } = this.data;
    if (type === 1) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败', err)
          })
      })
    } else {
      this.receiveEnvelope(false);
    }
  },

  /**
   * 获取账号信息
   */
  async getAccountInfo() {
    const res = await queryAccountInfo();
    if (res) {
      this.setData({
        accountInfo: res
      });
      this.amountAnimate();
    }
  },

  /**
   * 数额增加动画
   */
  amountAnimate() {
    this.animate('#gold-count', [
      { scale: [1] },
      { scale: [1.3] },
      { scale: [1] },
      ], 1000, () => {
        this.clearAnimation('#gold-count', () => {
          console.log("清除了#gold-count上的动画属性")
        })
    })
  },

  /**
   * 获取每日任务列表
   */
  async getTaskList() {
    const res = await queryClockInfo();
    if (res) {
      const { rewardList } = res;
      this.setData({
        taskList: rewardList
      })
    }
  },

  /**
   * 获取红包墙列表
   */
  async getRedWallList() {
    const res = await queryRedWallList();
    if (res) {
      this.setData({
        redEnvelopeList: res
      });
      this.resetInterval();
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