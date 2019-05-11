// pages/other/refund/refund.js
const app = getApp()
import util from "../../../utils/util.js"
import CheckLoginStatus from "../../../utils/CheckLoginStatus.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: { "orderitems": [{ "ordertype": 30, "orderid": "180720174600168951", "proid": "170927123602232913", "prono": "", "proname": "【德明贸易】阿德莱德女王佳美娜梅洛红葡萄酒750ml", "skuid": "", "skutext": null, "skuno": null, "pic": "http://images.weigouyi.cn/_P/201709/s-80-80-123504528406.jpg", "price": "98.00", "refundprice": "98.00", "buycount": 2, "itemid": "180720174530009724", "packageid": null, "isrushbuy": false, "isrefundorder": false, "refundstatus": -1, "isexchangeorder": false, "exchangestatus": -1 }] },
    problemText: "",
    options: "",//传来的参数
    payCode: "",//支付信息
  },
  problemInput(e) {
    this.setData({
      problemText: e.detail.value
    })
  },
  subRefund() {
    app.showLoading("请求中")
    if (this.data.problemText.length < 1) {
      app.alerts("请填写退款原因")
      wx.hideLoading()
      return 
    }
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/RefuncOrder?devicetype=5&uid=' + wx.getStorageSync('SessionUserID'),
      method: "POST",
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        orderid: this.data.options.orderid,
        itemid: this.data.options.itemid,
        proid: this.data.options.proid,
        buycount: this.data.options.buycount,
        price: this.data.options.price,
        description: this.data.problemText,
        wayid: this.data.payCode.wayid,
        bankbranch: "",
        account: "",
        name: ""
      },
      header: 1,
      successBack: (ret) => {
        wx.hideLoading()
        console.log(ret)
        if (ret && ret.data.success && ret.data.status == 1) {
          app.showtips("申请退款成功")
          setTimeout(()=> {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }else {
          app.promsg(ret.data.err)
        }
      }
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
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserCashWithdrawalWay?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        orderid: this.data.options.orderid
      },
      header: 1,
      successBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1) {
          this.setData({
            payCode: ret.data.Data[0]
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