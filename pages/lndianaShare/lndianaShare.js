// pages/lndianaShare/lndianaShare.js
const app = getApp()
const util = require("../../utils/util.js")
const sharebox = require('../../Component/sharebox/sharebox.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},              // 获取传递数据
    shareNum: 0,              // 需要分享次数
    showshare: [false, true], // 分享弹窗
    userData: {},             // user数据
    msg: {}                   // 商品数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
    })
    console.log(this.data.options)
    this.getData(options)
    this.getProductMsg(options)
  },
  // 获取分享夺宝数据
  getData() {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/IsPayCloud?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
      method: 'post',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        cloudid: this.data.options.cid,
        // buycount: this.data.options.buycount
        buycount: 0
      },
      header: 1,
      successBack: (ret) => {
        if (ret.data.success && ret.data.status == 1) {
          let data = ret.data.Data
          if (data.sharedes && data.sharedes.length > 0) {
            data.sharedes = JSON.parse(data.sharedes)
          }
          this.setData({
            userData: data
          })
          // remaining 是分享需要次数
          console.log(this.data.userData)
        } else if (ret.data.success && ret.data.status == 20) {
          let data = ret.data.Data
          if (data.sharedes && data.sharedes.length > 0) {
            data.sharedes = JSON.parse(data.sharedes)
          }
          this.setData({
            userData: data
          })
        } else {
          return app.promsg(ret.err)
        }
        
      }
    })
  },
  // 获取夺宝商品信息
  getProductMsg(options) {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/GetOneCloudShoppingSet?devicetype=5',
      data: {
        cloudid: options.cid,
        uid: wx.getStorageSync("SessionUserID")
      },
      header: 1,
      successBack: this.msgSuccessBack
    })
  },
  // 夺宝商品信息成功回调函数
  msgSuccessBack(ret) {
    console.log(ret)
    if (ret.data.success && ret.data.status == 1) {
      const data = ret.data.Data[0]
      // 转换为合法路径
      data.proimg = data.proimg.replace('weigouyi', 'rushouvip')
      this.setData({
        msg: data
      })
      console.log(data)
    } else {
      app.promsg(ret.data.err)
    }
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
    var that = this
    let ruid = wx.getStorageSync('SessionUserID')
    return {
      // title: that.data.msg.sharetitle,
      title: this.data.userData.username + '@您，' + '邀您一起来抽奖',
      imageUrl: that.data.msg.proimg,
      path: `/pages/lndiresult/lndiresult?cloudid=${that.data.msg.cloudid}&ruid=${ruid}`,
      success: function (res) {
        // 转发成功
        app.showtips('转发成功')
      },
      fail: function (res) {
        // 转发失败
        app.promsg('转发失败')
      }
    }
    
  },
  show () {
    this.setData({
      showshare: [true, true]
    })
  },
  closeshare () {
    this.setData({
      showshare: [false, true]
    })
  },
  // 分享朋友圈海报图片
  sharequan () {
    var that = this
    sharebox.sharequan(that, 3, 'lndiana')
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
  //关闭二次弹窗
  closesharebox: function () {
    this.setData({
      showtan: false
    })
  },
  // 跳转支付页面
  goPay () {
    if (this.data.userData.remaining == 0) {
      wx.navigateTo({
        url: `/pages/mylndiana/mylndiana`,
      })
      return
    }
    wx.navigateTo({
      url: `/pages/ordercomfirm/ordercomfirm?cid=${this.data.options.cid}&buyCounts=${this.data.options.buycount}&way=lndiana`,
    })
  }
})