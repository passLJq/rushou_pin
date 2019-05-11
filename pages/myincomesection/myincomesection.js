// pages/myincomesection/myincomesection.js
const app = getApp()
const utils = require('../../utils/util.js')
var currentPage=1
var stops=false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeData:'',
    commisiontype:0,
    msgdata:[],
    years:'',
    month:'',
    showsai:false,
    touheight:0,
    xiahuag:-600
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    this.setData({
      years: options.years,
      month :options.month
    })
    wx.setNavigationBarTitle({
      title: options.years + '年' + options.month +'月收益'
    })
    this.databind()
    wx.createSelectorQuery().select('#tou').boundingClientRect(function (rect) {
      that.setData({
        touheight:rect.height  
      })
    }).exec()
  },
  databind:function(){
    var that=this
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/CommissionDetail',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        currentPage: currentPage,
        pageSize: 8,
        type: 0,
        commisiontype: that.data.commisiontype,
        year: that.data.years,
        month: that.data.month,
        devicetype: 5
      },
      header: 1,
      successBack: this.mingxi
    })
  },
  mingxi:function(ret){
    var that=this
    ret=ret.data
    if(ret.success){
      that.setData({
        typeData: ret.typeData
      })
      if (currentPage==1){
        that.setData({
          msgdata: ret.Data
        })
      }else if(ret.status==1){
        that.setData({
          msgdata: that.data.msgdata.concat(ret.Data)
        })
      } else if (ret.status == 2){
         stops=true
      }
      console.log(that.data)
    }else{
      app.promsg(ret.err)
    }
  },
  xuanze:function(e){
    let index = e.currentTarget.dataset.type
    currentPage=1
    this.setData({
      commisiontype: index
    })
    this.databind()
    this.showsai()
  },
  showsai:function(){
    var me=''
    var that=this
    if (that.data.showsai){
      me = -600
    }else{
      me = that.data.touheight
    }
    this.setData({
      showsai: !this.data.showsai,
      xiahuag: me
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
    //重置参数
    currentPage = 1

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that=this
    stops=false;
    currentPage=1
    that.databind()

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    if (!stops) {
      currentPage++
      that.databind()
    }
  }
})