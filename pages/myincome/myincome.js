// pages/myincome/myincome.js
const app = getApp()
const utils = require('../../utils/util.js')
// const goapp = require('../../Component/goapp/goapp.js')
var Charts = require('../../utils/wxcharts.js');
var columnChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mengdata: '',
    mingxi:'',
    goapp: false,
    msgtitlle: "查看收益明细功能请移步至APP喔~"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetMemberJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        devicetype: 5
      },
      header: 1,
      successBack: this.databind
    })
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserCommissionDetail',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        devicetype: 5
      },
      header: 1,
      successBack: this.mingxi
    })
      utils.http({
        url: app.globalData.siteUrl + '/Main/Member/GetUserSevenDaysCommission',
        data: {
          uid: wx.getStorageSync('SessionUserID'),
          yshopid: wx.getStorageSync('fxshopid'),
          devicetype: 5
        },
        header: 1,
        successBack: this.zhu
      })
  },
  databind: function (ret) {
    var that = this
    console.log(ret)
    ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        mengdata: ret
      })
    } else {
      app.promsg(ret.err)
    }
  },
  mingxi:function(ret){
    var that = this
    console.log(ret)
    ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        mingxi: ret.Data
      })
    } else {
      app.promsg(ret.err)
    }
  },
  zhu: function (ret) {
    var xzhu = []
    var yzhu = []
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    var that = this
    console.log(ret)
    ret = ret.data
    if (ret.status == 1 && ret.success && ret.Data != null) {
      for (var i in ret.Data) {
        xzhu.push(i)
        yzhu.push(parseFloat(ret.Data[i].toFixed(2)))
      }
      new Charts({
        canvasId: 'mychart-bar',
        type: 'column',
        categories: xzhu,
        legend:false,                
        series: [{
          name: '收益',
          data: yzhu,
          format: function (val, name) {
            return val.toFixed(2);
          }
        }],
        yAxis: {
          format: function (val) {
            return val;
          }
         },
        width: windowWidth,
        height: 190,
        dataLabel: true
      });
    } else {
      app.promsg(ret.err)
    }
  },
  opengoapp:function (e) {
    let etime = e.currentTarget.dataset.year
    let years = etime.split("年")[0]
    let month = etime.split("年")[1].split("月")[0]
    wx.navigateTo({
      url: '../myincomesection/myincomesection?years=' + years + '&month=' + month
    })
  },
  saverushou:function () {
    var that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              //授权完成
              goapp.saverushou()
            }
          })
        } else {
          goapp.saverushou()
        }
      }
    })
  },
  closegoapp:function () {
    this.setData({
      goapp: false
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