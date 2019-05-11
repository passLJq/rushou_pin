// pages/other/expressdetail/expressdetail.js
const app = getApp()
import util from "../../../utils/util.js"
import CheckLoginStatus from "../../../utils/CheckLoginStatus.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: "",//过来的订单信息
    deliverydata: "",//物流总信息
    expressjson: "",//物流详细
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
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
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetOrderListJson?devicetype=5',
      data: {
        currpage: 1,
        pagesize: 1,
        uid: wx.getStorageSync('SessionUserID'),
        orderid: this.data.options.orderid
      },
      header: 1,
      successBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1) {
          this.setData({
            deliverydata: ret.data.Data[0].deliverydata,
            expressjson: (ret.data.Data[0].deliverydata && ret.data.Data[0].deliverydata.expressjson) ? JSON.parse(ret.data.Data[0].deliverydata.expressjson) : ""
          })
        }
      }
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