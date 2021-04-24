// pages/task/task.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountInfo: {
      gold: 1800000,
      money: 18766
    },
    tabList: ['每日任务', '红包墙'],
    tabIndex: 0,
    taskList: [{
      id: 1,
      name: '今日闯过一关',
      total: 1,
      pass: 1,
      status: 1,
      goldCount: 5000,
    }, {
      id: 2,
      name: '今日闯过五关',
      total: 5,
      pass: 5,
      status: 0,
      goldCount: 5000,
    }, {
      id: 3,
      name: '今日闯过十关',
      total: 10,
      pass: 5,
      status: 0,
      goldCount: 5000,
    }, {
      id: 4,
      name: '今日闯过二十关',
      total: 20,
      pass: 5,
      status: 0,
      goldCount: 5000,
    }],
    redEnvelopeInterval: 300,
    redEnvelopeList: [{
      id: 0,
      timLeft: 180
    }, {
      id: 1,
      timLeft: 60
    }, {
      id: 2,
      timLeft: 90
    }, {
      id: 3,
      timLeft: 99
    }, {
      id: 4,
      timLeft: 20
    }, {
      id: 5,
      timLeft: 0
    }, {
      id: 6,
      timLeft: 0
    }, {
      id: 7,
      timLeft: 0
    }, {
      id: 8,
      timLeft: 0
    }],
    envelopeVisible: false,
    envelopeImgNames: ['tjhb', 'gghb', 'jbhb'],
    redEnvelope: {
      type: 2, // 0 天降红包 1 过关红包 2 金币红包
      count: 2000,
    },
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
          selected: 1
      });
    }
    this.resetInterval();
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
    const { id } = e.currentTarget.dataset;
    this.setData({
      envelopeVisible: true
    })
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
          let prevTime = item.timLeft;
          if (item.timLeft > 0) {
            prevTime -= 1;
          }
          return {
            ...item,
            timLeft: prevTime,
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
    return this.data.redEnvelopeList.some(item => item.timLeft > 0);
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
    const { id } = e.currentTarget.dataset;
    this.setData({
      envelopeVisible: true
    })
  },

    /**
   * 关闭红包弹窗
   */
  closeEnvelope() {
    this.setData({
      envelopeVisible: false
    })
  },
})