// pages/messagelist_section/messagelist_section.js
const utils = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage:1,
    listdata:[],
    stops:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  this.setData({
    options: options
  })
    this.databind()
  },
databind:function(){
  var that = this
  utils.http({
    url: app.globalData.siteUrl + '/Main/Member/GetMyMessageList?devicetype=5',
    data: {
      uid: wx.getStorageSync('SessionUserID'),
      currentPage: this.data.currentPage,
      pageSize: 8,
      type: 0,
      itemcode: that.data.options.type
    },
    header: 1,
    successBack: (ret) => {
      console.log(ret)
      if (ret.data.status == 1 && ret.data.success) {
        if (this.data.currentPage==1){
          that.setData({
            listdata: []
          })
        }
        that.setData({
          listdata: that.data.listdata.concat(ret.data.Data)
        })
      } else if (ret.data.status == 2 && ret.data.success){
        that.setData({
          stops:true
        })
      } else {
        app.promsg(ret.err)
      }
    }
  })
},
  goother:function(e){
    var that=this
    var indes=e.currentTarget.dataset.index
    console.log(that.data.listdata[indes].msgid)
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/UpdateMessage?devicetype=5&uid=' + wx.getStorageSync('SessionUserID'),
      method: "post",
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        msgid: that.data.listdata[indes].msgid
      },
      header: 1,
      loading_icon: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret && ret.data.success && ret.data.status === 1) {
          let listdata = this.data.listdata
          listdata[indes].isread = true
          that.setData({
            listdata
          })
        }
        if (that.data.options.type == '1') {
          wx.navigateTo({
            url: "/pages/orderdetail/orderdetail?orderid=" + that.data.listdata[indes].contentjson.order_id,
          })
        } else if (that.data.options.type == '4') {
          wx.navigateTo({
            url: "/pages/other/fxordersdetail/fxordersdetail?orderid=" + that.data.listdata[indes].contentjson.order_id,
          })
        }
      },
      errorBack: (err)=> {
        if (that.data.options.type == '1') {
          wx.navigateTo({
            url: "/pages/orderdetail/orderdetail?orderid=" + that.data.listdata[indes].contentjson.order_id,
          })
        } else if (that.data.options.type == '4') {
          wx.navigateTo({
            url: "/pages/other/fxordersdetail/fxordersdetail?orderid=" + that.data.listdata[indes].contentjson.order_id,
          })
        }
      }
    })

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
    var that=this
    if (!this.data.stops){
      that.data.currentPage++
      that.databind()
    }
  }
})