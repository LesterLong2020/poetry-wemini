// custom-tab-bar/index.js
import { queryIsShow } from '../utils/api'

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#D81E06",
    list: [ {
      "pagePath": "/pages/answer/answer",
      "text": "答题",
      "iconPath": "/images/answer_default.png",
      "selectedIconPath": "/images/answer_select.png"
    },
    {
      "pagePath": "/pages/task/task",
      "text": "任务",
      "iconPath": "/images/task_default.png",
      "selectedIconPath": "/images/task_select.png"
    },
    {
      "pagePath": "/pages/withdraw/withdraw",
      "text": "提现",
      "iconPath": "/images/withdraw_default.png",
      "selectedIconPath": "/images/withdraw_select.png"
    }]
  },

  attached() {
    console.log(123);
    this.getIsShow();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
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
  }
})
