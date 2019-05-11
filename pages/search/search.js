// pages/search/search.js
const app = getApp()
const WxSearch = require('../wxSearch/wxSearch.js')
const utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
   text:'',
   hots:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //初始化的时候渲染wxSearchdata 第二个为你的search高度
    WxSearch.init(that, 48, ['这是热搜显示'], false);
		// 暂不显示热搜
    // utils.http({
    //   url: app.globalData.siteUrl + '/Main/Main/GetHotSearch',
    //   data: {
    //     currentPage: 1,
    //     pageSize: 8,
    //   },
    //   successBack: that.reshou
    // })
  },
  wxSearchFn: function (e) {
    var that = this
    if (that.data.wxSearchData.value == undefined) {
      that.data.wxSearchData.value = ''
    }
    that.searchpro(that.data.wxSearchData.value)
    WxSearch.wxSearchAddHisKey(that);
  },
  wxSearchInput: function (e) {
    var that = this
    that.setData({
      text:e.detail.value
    })
    utils.http({
      url: app.globalData.siteUrl + '/Main/Main/GetHotSearch',
      data: {
        currentPage: 1,
        pageSize: 8,
        content: e.detail.value
      },
      successBack: that.searchkey,
      loading_icon:1
    })
    // that.searchkey(e.detail.value)
  },
  wxSerchFocus: function (e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function (e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function (e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
  },
  wxSearchDeleteKey: function (e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function (e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function (e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  },
  searchkey:function (ret) {
    var that = this;
    ret=ret.data
    if (ret.success && ret.status == 1 ){
      WxSearch.initMindKeys(ret.Data.prolist);
      WxSearch.wxSearchInput(that.data.text, that);

    }else{
      app.promsg(ret.err)
    }
  },
  reshou:function(ret){
    var that = this;
    ret = ret.data
    if (ret.success && ret.status == 1) {
     that.setData({
       hots: ret.Data.prolist
     })
    } else {
      app.promsg(ret.err)
    }
  },
  searchpro:function(value){
    wx.navigateTo({
      url: '../prolist/prolist?value='+value
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
  
  }
})