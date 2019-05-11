// pages/orderdetail/orderdetail.js
const app = getApp()
import util from "../../utils/util.js"
import CheckLoginStatus from "../../utils/CheckLoginStatus.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: "",//商品数据
    options: "",//过来的订单信息
    expressjson: "",//物流详情
  },
  toRefund(e) {
    app.showLoading("请求中")
    wx.navigateTo({
      url: '/pages/other/refund/refund?orderid=' + e.currentTarget.dataset.orderid + '&itemid=' + e.currentTarget.dataset.itemid + '&proid=' + e.currentTarget.dataset.proid + '&buycount=' + e.currentTarget.dataset.buycount + '&refundprice=' + e.currentTarget.dataset.refundprice + '&proname=' + e.currentTarget.dataset.proname + '&pic=' + e.currentTarget.dataset.pic + '&skutext=' + e.currentTarget.dataset.skutext,
    })
    wx.hideLoading()
  },
  toExpressDetail(e) {
    var sasd = e.currentTarget.dataset.orid
    wx.navigateTo({
      url: '/pages/other/logisticsdetail/logisticsdetail?orderid=' + sasd,
    })
  },
  toCopy(e) {
    wx.setClipboardData({
      data: this.data.list.orderid,
      success(res) {
        app.showtips("复制成功")
      },
      fail(err) {
        app.promsg("复制失败")
      }
    })
  },
  toReceipt(e) {
    app.alerts("您确定已收到货物了吗？", {
      successBack: () => {
        util.http({
          url: app.globalData.siteUrl + '/Main/Member/ReceiptOrder?devicetype=5&uid=' + wx.getStorageSync('SessionUserID'),
          method: "POST",
          data: {
            uid: wx.getStorageSync('SessionUserID'),
            orderid: e.currentTarget.dataset.orderid
          },
          header: 1,
          successBack: (ret) => {
            if (ret && ret.data.success && ret.data.status == 1) {
              app.showtips("收货成功")
              setTimeout(() => {
                this.getMsg()
              }, 1000)
            } else {
              app.promsg("收货失败")
            }
          }
        })
      }
    })
  },
  getMsg() {
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
            list: ret.data.Data[0],
            expressjson: (ret.data.Data[0].deliverydata && ret.data.Data[0].deliverydata.expressjson) ? JSON.parse(ret.data.Data[0].deliverydata.expressjson) : ""
          })
        }
      }
    })
  },
  tohuanpro:function(e){
    wx.navigateTo({
      url: '/pages/huanpro/huanpro?orderid=' + e.currentTarget.dataset.orderid + '&itemid=' + e.currentTarget.dataset.itemid + '&proid=' + e.currentTarget.dataset.proid + '&buycount=' + e.currentTarget.dataset.buycount + '&proname=' + e.currentTarget.dataset.proname + 'packageid=' + e.currentTarget.dataset.packageid
    })
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
    CheckLoginStatus.checksession(() => {
    this.getMsg()
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