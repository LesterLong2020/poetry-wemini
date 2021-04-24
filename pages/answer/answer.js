// pages/anwser/anwser.js
import questionList from "../../assets/questions";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountInfo: {
      gold: 1800000,
      money: 18766
    },
    questionTypes: ['成语填空', '诗词作者', '成语含义'],
    questionDescs: ['空缺的字应为？', '此诗词的作者是？', '描述的成语是？'],
    question: {},
    questionIndex: 0,
    chooseAnswer: '',
    envelopeVisible: false,
    envelopeImgNames: ['tjhb', 'gghb', 'jbhb'],
    redEnvelope: {
      type: 1, // 0 天降红包 1 过关红包 2 金币红包
      count: 190,
    },
    timeLeft: 30,
    timeLeftStr: '',
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
          selected: 0
      });
    }
    this.getQuestion(0);
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
   * 获取问题
   * @param {*} index 
   */
  getQuestion(index) {
    this.setData({
      question: questionList[index],
      questionIndex: index,
      chooseAnswer: ''
    })
  },

  /**
   * 选择答案
   * @param {*} e 
   */
  hanldeChooseAnswer(e) {
    const { answer } = e.currentTarget.dataset;
    const { chooseAnswer, accountInfo } = this.data;
    if (!chooseAnswer) {
      console.log(answer)
      this.setData({
        chooseAnswer: answer
      });
      setTimeout(() => {
        this.setData({
          redEnvelope: {
            type: 2,
            count: 1200
          },
          envelopeVisible: true,
          accountInfo: {
            ...accountInfo,
            gold: 2000000
          }
        })
      }, 1500)
    }
  },

  /**
   * 关闭红包弹窗
   */
  closeEnvelope() {
    this.setData({
      envelopeVisible: false
    });
  },

  /**
   * 打开天降红包弹窗
   */
  openEnvelopeModal() {
    if (this.data.timeLeft === 0) {
      this.setData({
        envelopeVisible: true
      })
    }
  },

  /**
   * 收下红包
   */
  acceptEnvelope() {
    const { questionIndex } = this.data;
    this.setData({
      envelopeVisible: false
    });
    this.getQuestion((questionIndex + 1) % 3);
    this.animate('.content-wrap', [
      { left: '100%' },
      { left: 0 },
      ], 300, () => {
        this.clearAnimation('.content-wrap', () => {
          console.log("清除了.content-wrap上的动画属性")
        })
    });
    this.animate('#gold-count', [
      { scale: [1] },
      { scale: [1.3] },
      { scale: [1] },
      ], 1000, () => {
        this.clearAnimation('#gold-count', () => {
          console.log("清除了#gold-countt上的动画属性")
        })
    })
  },

   /**
   * 初始化红包定时器
   */
  resetInterval() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.data.timeLeft > 0) {
      this.timer = setInterval(() => {
        const { timeLeft } = this.data
        let prevTime = timeLeft
        if (timeLeft > 0) {
          prevTime -= 1;
        } else {
          clearInterval(this.timer);
        }
        this.setData({
          timeLeft: prevTime,
          timeLeftStr: this.formatTime(prevTime)
        });
      }, 1000)
    }
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

})