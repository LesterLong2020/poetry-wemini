// pages/task/task.js
import { 
  report, reportType,
  queryAccountInfo,
  queryClockInfo,
  receiveDailyReward,
  receiveRedWall,
  queryRedWallList,
} from '../../utils/api';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
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
    // const openId = wx.getStorageSync('openId');
    // report({
    //   openId,
    //   page: '任务',
    //   type: reportType.page
    // });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
          selected: 1
      });
    }

    const token = wx.getStorageSync('token');
    if (token) {
      this.getAccountInfo();
      this.getTaskList();
      this.getRedWallList();
    } else {
      app.loginCallBack = () => {
        this.getAccountInfo();
        this.getTaskList();
        this.getRedWallList();
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
  openRedEnvelope(e) {
    const { index } = e.currentTarget.dataset;
    const { redEnvelope } = this.data;
    this.setData({
      envelopeVisible: true,
      redEnvelope: {
        ...redEnvelope,
        amount: 20000
      },
      rewardInfo: {
        type: 1,
        index
      }
    });
  },

    /**
   * 关闭红包弹窗
   */
  closeEnvelope() {
    this.setData({
      envelopeVisible: false
    })
  },
  
  /**
   * 领取红包
   * @param {*} hasAd 
   */
  async receiveEnvelope(hasAd = false) {
    const { rewardInfo: { type, rewardId, index } } = this.data;
    const param = type === 0 ? { rewardId } : { index };
    const apiFc = type === 0 ? receiveDailyReward : receiveRedWall;
    const res = await apiFc(param);
    if (res) {
      this.getAccountInfo();
    }
    this.closeEnvelope();
    if (type === 0) {
      this.getTaskList();
    } else {
      this.getRedWallList();
    }
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
    wx.showModal({
      title: '看视频广告',
      content: '广告内容',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定');
          this.receiveEnvelope(true);
        } else if (res.cancel) {
          console.log('用户点击取消');
          this.receiveEnvelope(false);
        }
      }
    })
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
  }
})