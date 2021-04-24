// components/navigation/navigation.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '夕宿兮君'
    },
    showBack: {
      type: Boolean,
      value: true
    },
    showHome: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      const { statusBarHeight, screenWidth } = wx.getSystemInfoSync();
      const { top, right, width, height } = wx.getMenuButtonBoundingClientRect();
      this.setData({
        left: (screenWidth - right) + 'px',
        top: top + 'px',
        width: (screenWidth - (screenWidth - right)*2 - width) + 'px',
        height: height + 'px',
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 返回
     */
    back() {
      wx.navigateBack();
    },

    /**
     * 返回首页
     */
    goHome() {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  }
})
