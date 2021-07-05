// pages/anwser/anwser.js
import { 
  report, reportType,
  queryAccountInfo, queryNextQuestion, submitAnswer, queryScheduleRedInfo, 
  receiveScheduleRed, queryPassRedAmount, receivePassRed, queryIsShow
} from '../../utils/api';

const app = getApp();
let videoAd = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
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
    timeLeft: 0,
    timeLeftStr: '',
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
      console.log(res, '关闭广告');
      if (this.data.isShow) {
        if (res.isEnded) {
          this.reveivePassRedEnvelope();
          report({
            subType: 'pass_envelop',
            content: {
              result: 'complete'
            },
            type: reportType.incentive
          });
        } else {
          wx.showToast({
            title: '需看完广告才能获得现金红包哦',
            icon: 'none',
            duration: 2000
          })
          this.refreshQuestion();
          report({
            subType: 'pass_envelop',
            content: {
              result: 'uncomplete'
            },
            type: reportType.incentive
          });
        }
      } else {
        this.refreshQuestion();
      }
    })
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
          selected: 0
      });
    }
    const token = wx.getStorageSync('token');
    if (token && app.globalData.isValid) {
      this.getAccountInfo();
      this.getScheduleRedInfo();
      this.getQuestion();
      report({
        page: '答题',
        subType: 'answer',
        type: reportType.page
      });
    } else {
      app.loginCallBack = () => {
        console.log('已登录')
        this.getAccountInfo();
        this.getScheduleRedInfo();
        this.getQuestion();
        report({
          page: '答题',
          subType: 'answer',
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
   * 查询是否显示
   */
  async getIsShow() {
    const res = await queryIsShow();
    this.setData({
      isShow: res
    })
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
    const { isShow } = this.data;
    const res = await submitAnswer({ answerId, answer });
    if (res) {
      report({
        subType: 'right',
        type: reportType.answer
      });
      if (isShow) {
        await this.getPassRedEnvelope();
        setTimeout(() => {
          this.setData({
            envelopeVisible: true
          });
          report({
            subType: 'pass_envelop',
            type: reportType.popup
          });
        }, 500)
      } else {
        videoAd.show().catch(() => {
          // 失败重试
          videoAd.load()
            .then(() => videoAd.show())
            .catch(err => {
              console.log('激励视频 广告显示失败', err)
            })
        })
        wx.showToast({
          title: '回答正确！',
          icon: 'success'
        });
        // setTimeout(() => {
        //   this.refreshQuestion();
        // }, 1500);
      }
    } else {
      report({
        subType: 'wrong',
        type: reportType.answer
      });
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
    if ( type === 0 ) {
      this.setData({
        envelopeVisible: false
      });
    } else if (type === 1) {
      wx.showModal({
        title: '提示',
        content: '确认是否关闭？若选择确定关闭，则无法获得奖励',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              envelopeVisible: false
            });
            this.refreshQuestion();
          }
        }
      })
    }
  },

  /**
   * 打开天降红包弹窗
   */
  async openEnvelopeModal() {
    await this.getScheduleRedInfo();
    if (this.data.timeLeft === 0) {
      this.setData({
        envelopeVisible: true
      });
      report({
        subType: 'skyfall_envelop',
        type: reportType.popup
      });
    }
  },

  /**
   * 收下红包
   */
  acceptEnvelope() {
    const { redEnvelope: { type } } = this.data;
    this.setData({
      envelopeVisible: false
    });
    if (type === 0) { 
      this.receiveScheduleRed();
    } else {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败', err)
          })
      })
    }
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
          amount: res.value,
          type: 0
        },
        timeLeft: res.remainSeconds
      });
      this.resetInterval();
    }
    return res;
  },

  /**
   * 领取天降红包
   */
  async receiveScheduleRed() {
    const { redEnvelope: { amount } } = this.data;
    const res = await receiveScheduleRed({ amount });
    if (res) {
      this.getAccountInfo();
      this.getScheduleRedInfo();
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
    return res;
  },

  /**
   * 领取过关红包
   */
  async reveivePassRedEnvelope() {
    const { question: { questionCount }, redEnvelope: { amount } } = this.data;
    const res = await receivePassRed({ level: questionCount, amount });
    this.refreshQuestion();
    if (res) {
      wx.showToast({
        title: `恭喜您获得${amount}元现金，已放入现金账户`,
        icon: 'none',
        duration: 2000
      })
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