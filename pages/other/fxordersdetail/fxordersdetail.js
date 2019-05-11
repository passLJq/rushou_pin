// pages/other/fxordersdetail/fxordersdetail.js
const app = getApp()
const util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderid: "",//订单ID
    listMsg: "",//数据
  },
  getMsg(state) {
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserSalesDetail?devicetype=5',
      data: {
        currentPage: 1,
        pageSize: 1,
        uid: wx.getStorageSync('SessionUserID'),
        orderid: this.data.orderid
      },
      loading_icon: state,
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
          this.setData({
            listMsg: ret.data.Data[0]
          })
        } else {
          app.promsg(ret.err)
        }
      }
    })
    let timer = setTimeout(() => {
      wx.stopPullDownRefresh()
      clearTimeout(timer)
      timer = null
    }, 1500)


  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      orderid: options.orderid
    })
    this.getMsg(1)
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})