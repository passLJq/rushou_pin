// pages/other/aftersale/aftersale.js
const app = getApp()
const util = require("../../../utils/util.js")
const CheckLoginStatus = require("../../../utils/CheckLoginStatus.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    slide: 0,//1=退款订单, 2=换货订单
    page: [1, 1],//第几页
    pagesize: [10, 10],//每一页的数量
    refund: "",//退款订单数据
    exchangeGoods: "",//换货订单数据
  },
  changeSlide(e) {
    this.setData({
      slide: parseInt(e.currentTarget.dataset.idx)
    })
    if(this.data.slide === 0 && !this.data.refund) {
      this.getMsg()
    } else if (this.data.slide === 1 && !this.data.exchangeGoods){
      this.getMsg()
    }
    
  },
  getMsg() {
    if(this.data.slide === 0) {
      util.http({
        url: app.globalData.siteUrl + '/Main/Member/GerRefuncOrderList?devicetype=5',
        data: {
          currpage: this.data.page[this.data.slide],
          pagesize: this.data.pagesize[this.data.slide],
          uid: wx.getStorageSync('SessionUserID')
        },
        header: 1,
        successBack: (ret) => {
          if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
            this.setData({
              refund: ret.data.Data
            })
          } else {
            app.promsg(ret.err)
          }
        }
      })
    }else {
      util.http({
        url: app.globalData.siteUrl + '/Main/Member/GerExchangeOrderList?devicetype=5',
        data: {
          currpage: this.data.page[this.data.slide],
          pagesize: this.data.pagesize[this.data.slide],
          uid: wx.getStorageSync('SessionUserID')
        },
        header: 1,
        successBack: (ret) => {
          console.log(ret)
          if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
            this.setData({
              exchangeGoods: ret.data.Data
            })
          } else {
            app.promsg(ret.err)
          }
        }
      })
    }
    let timer = setTimeout(()=>{
      wx.stopPullDownRefresh()
    }, 1500)
   

  },
  toOrderDetail(e) {
    wx.navigateTo({
      url: "/pages/orderdetail/orderdetail?orderid=" + e.currentTarget.dataset.orderid,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMsg()
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
    let {page} = this.data
    page[this.data.slide] = 1
    this.setData({
      page: page
    })
    this.getMsg()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { page } = this.data
    page[this.data.slide] += 1
    this.setData({
      page: page
    })
    this.getMsg()
  }
})