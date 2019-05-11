// pages/huanpro/huanpro.js
const utils = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    liuyan: '',
    src: "https://images.rushouvip.cn/IMG/upPhoto.png"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      options: options
    })
  },
  bin1: function(e) {
    this.setData({
      liuyan: e.detail.value
    })
  },
  huanimg: function() {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        wx.uploadFile({
          url: app.globalData.memberSiteUrl + '/Ajax/FileUpload.ashx', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            "Content-Type": "application/json; charset=utf-8"
          },
          success: function(ret) {
            console.log(ret)
            var data = ret.data
            //不支持单引号转换为双引号
            data = JSON.parse(data.replace(/\'/ig, "\""));
            if (data.success == 1) {
              var img = data.fullurl
              that.setData({
                src:unescape(img)
              })
            }else{
              app.promsg(data.error)
            }
          },
          fail: function(res) {
            app.promsg(res)
          }
        })
      }
    })
  },
  okup: function () {
    var that = this
    if (that.data.liuyan==''){
      app.promsg('换货原因不能为空')
      return
    }
    if (that.data.src == '' || that.data.src =='https://images.rushouvip.cn/IMG/upPhoto.png') {
      app.promsg('请上传图片')
      return
    }
      utils.http({
        url: app.globalData.siteUrl + '/Main/Member/ExchangeOrder?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
        data: {
          orderid: that.data.options.orderid,
          itemid: that.data.options.itemid,
          proid: that.data.options.proid,
          packageid: that.data.options.packageid,
          uid: wx.getStorageSync("SessionUserID"),
          img: that.data.src,
          desc: that.data.liuyan
        },
        method: "POST",
        header: 1,
        successBack: (ret) => {
          console.log(ret)
          if (ret.data.success) {
            app.promsg('提交成功')
            setTimeout(function(){
              wx.navigateBack({
                delta: 1
              })
            },1000)
          } else {
            app.promsg(ret.data.err)
          }
        }
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})