// pages/anwser/anwser.js
import { 
  report, reportType,
  queryAccountInfo, queryNextQuestion, submitAnswer, queryScheduleRedInfo, 
  receiveScheduleRed, queryPassRedAmount, receivePassRed
} from '../../utils/api';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountInfo: {
      goldCoinCount: 0,
      amount: 0
    },
    questionTypes: ['成语填空', '成语含义', '诗词作者'],
    questionDescs: ['空缺的字应为？', '描述的成语是？', '此诗词的作者是？'],
    question: {},
    chooseAnswer: '',
    envelopeVisible: false,
    envelopeImgNames: ['tjhb', 'gghb', 'jbhb'],
    redEnvelope: {
      type: 1, // 0 天降红包 1 过关红包 2 金币红包
      amount: 0,
    },
    timeLeft: 30,
    timeLeftStr: '',
  },

  timer: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // const audioContext = wx.createInnerAudioContext();
    // audioContext.src = '/audio/qnl.mp3';
    // audioContext.loop = true;
    // setTimeout(() => {
    //   console.log('开始播放');
    //   audioContext.play();
    // }, 1000)
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
    // report({
    //   openId,
    //   page: '答题',
    //   type: reportType.page
    // });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
          selected: 0
      });
    }
    const token = wx.getStorageSync('token');
    if (token) {
      this.getAccountInfo();
      // this.getScheduleRedInfo();
      this.getQuestion();
      this.resetInterval();
    } else {
      app.loginCallBack = () => {
        console.log('已登录')
        this.getAccountInfo();
        // this.getScheduleRedInfo();
        this.getQuestion();
        this.resetInterval();
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
   * 获取问题
   */
  async getQuestion() {
    const res = await queryNextQuestion();
    if (res) {
      const { question, type, answer } = res;
      this.setData({
        question: res,
        chooseAnswer: ''
      })
      if (type === 1) {
        const anwserIndex = question.indexOf(answer);
        this.setData({
          question: {
            ...res,
            anwserIndex
          }
        })
      }
    }
  },

  /**
   * 选择答案
   * @param {*} e 
   */
  hanldeChooseAnswer(e) {
    const { answer } = e.currentTarget.dataset;
    const { chooseAnswer, question: { answerId, anwserIndex, question, type } } = this.data;
    if (!chooseAnswer) {
      this.setData({
        chooseAnswer: answer
      });
      let questionAnswer = answer;
      if (type === 1) {
        questionAnswer = question.slice(0, anwserIndex) + answer + question.slice(anwserIndex + 1);
      }
      this.answerQuestion(answerId, questionAnswer);
    }
  },

  /**
   * 提交问题答案
   * @param {*} answerId 
   * @param {*} answer 
   */
  async answerQuestion(answerId, answer) {
    const res = await submitAnswer({ answerId, answer });
    if (res) {
      await this.getPassRedEnvelope();
      setTimeout(() => {
        this.setData({
          envelopeVisible: true
        });
      }, 500)
    } else {
      wx.showToast({
        title: '回答错误，要加油哦！',
        icon: 'none'
      });
      setTimeout(() => {
        this.refreshQuestion();
      }, 1500);
    }
  },

  /**
   * 关闭红包弹窗
   */
  closeEnvelope() {
    const { redEnvelope: { type } } = this.data;
    this.setData({
      envelopeVisible: false
    });
    if ( type === 1 ) {
      this.refreshQuestion();
    }
  },

  /**
   * 打开天降红包弹窗
   */
  async openEnvelopeModal() {
    await this.getScheduleRedInfo();
    this.setData({
      envelopeVisible: true
    })
  },

  /**
   * 收下红包
   */
  acceptEnvelope() {
    const { redEnvelope: { type } } = this.data;
    this.setData({
      envelopeVisible: false
    });
    wx.showModal({
      title: '看视频广告',
      content: '广告内容',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定');
          if (type === 0) {
            this.receiveScheduleRed();
          } else {
            this.reveivePassRedEnvelope();
          }
        } else if (res.cancel) {
          console.log('用户点击取消');
          if (type === 1) {
            this.refreshQuestion();
          }
        }
      }
    })
  },

  /**
   * 数额增加动画
   */
  amountAnimate() {
    this.animate('#moneny-count', [
      { scale: [1] },
      { scale: [1.3] },
      { scale: [1] },
      ], 1000, () => {
        this.clearAnimation('#moneny-count', () => {
          console.log("清除了#moneny-countt上的动画属性")
        })
    });
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
   * 获取天降红包信息
   */
  async getScheduleRedInfo() {
    const res = await queryScheduleRedInfo();
    if (res) {
      this.setData({
        redEnvelope: {
          amount: res,
          type: 0
        }
      });
    }
  },

  /**
   * 领取天降红包
   */
  async receiveScheduleRed() {
    const { redEnvelope: { amount } } = this.data;
    const res = await receiveScheduleRed({ amount });
    if (res) {
      this.getAccountInfo();
      await this.getScheduleRedInfo();
      this.resetInterval();
    }
  },

  /**
   * 获取过关红包金额
   */
  async getPassRedEnvelope() {
    const { question: { questionCount } } = this.data;
    const res = await queryPassRedAmount({ level: questionCount });
    this.setData({
      redEnvelope: {
        amount: res || 0,
        type: 1
      }
    });
  },

  /**
   * 领取过关红包
   */
  async reveivePassRedEnvelope() {
    const { question: { questionCount }, redEnvelope: { amount } } = this.data;
    const res = await receivePassRed({ level: questionCount, amount });
    this.refreshQuestion();
    if (res) {
      this.getAccountInfo();
    }
  },

  /**
   * 刷新下一个问题
   */
  refreshQuestion () {
    this.getQuestion();
    this.animate('.content-wrap', [
      { left: '100%' },
      { left: 0 },
      ], 300, () => {
        this.clearAnimation('.content-wrap', () => {
          console.log("清除了.content-wrap上的动画属性")
        })
    });
  }
})