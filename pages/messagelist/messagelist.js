// pages/messagelist/messagelist.js
const utils = require('../../utils/util.js')
const app = getApp()
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  gosection:function(e){
    var types = e.currentTarget.dataset.itemcode
    wx.navigateTo({
      url: '../messagelist_section/messagelist_section?type=' + types
    })
  },
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
    var that=this
    CheckLoginStatus.checksession(() => {
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetMyFirstMessageList?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID')
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.status == 1 && ret.data.success) {
          that.setData({
            data:ret.data.Data
          })
        }else {
          app.promsg(ret.err)
        }
      }
    })
    })
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
  
  }
})