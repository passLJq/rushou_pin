// pages/order/order.js
const app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    msg: ["", "", "", "", ""],
    tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
    stv: {
      windowWidth: 0,
      scrollHeight: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,//当前第几个slide
    scrollTop: 0,//页面高度
    isLoad: false,//是否正在加载
    pagesize: 10,//每页的数量
    page: [1, 1, 1, 1, 1],//第几页
    orderstatus: ["all", "payment", "pending", "receipt", "completion"],//状态
    orderNoMore: [false, false, false, false, false],//没有更多数据
    noMsg: [false, false, false, false, false],//没有数据
    isIphoneX: app.globalData.isIphoneX,



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
  handlerStart(e) {
    let { clientX, clientY } = e.touches[0];
    this.startX = clientX;
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.data.stv.tStart = true;
    this.tapStartTime = e.timeStamp;
    this.setData({ stv: this.data.stv })
  },
  handlerMove(e) {
    let { clientX, clientY } = e.touches[0];
    let { stv } = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    stv.offset += offsetX;
    if (stv.offset <= 0) {
      stv.offset = 0;
    } else if (stv.offset >= stv.windowWidth * (this.tabsCount - 1)) {
      stv.offset = stv.windowWidth * (this.tabsCount - 1);
    }
    this.setData({ stv: stv });
  },
  handlerCancel(e) {

  },
  handlerEnd(e) {
    let { clientX, clientY } = e.changedTouches[0];
    let endTime = e.timeStamp;
    let { tabs, stv, activeTab } = this.data;
    let { offset, windowWidth } = stv;
    //快速滑动
    if (endTime - this.tapStartTime <= 300) {
      //向左
      if (Math.abs(this.tapStartY - clientY) < 50) {
        if (this.tapStartX === clientX) {
          return
        }
        if (this.tapStartX - clientX > 20) {
          if (activeTab < this.tabsCount - 1) {
            this.setData({ activeTab: ++activeTab })
          }
        } else if (this.tapStartX - clientX < -20) {
          if (activeTab > 0) {
            this.setData({ activeTab: --activeTab })
          }
        }
        stv.offset = stv.windowWidth * activeTab;
        this.changeMsg()
        this.setData({
          scrollTop: 0
        });
      } else {
        //快速滑动 但是Y距离大于50 所以用户是左右滚动
        let page = Math.round(offset / windowWidth);
        if (activeTab != page) {
          this.setData({ activeTab: page })
        }
        stv.offset = stv.windowWidth * page;
      }
    } else {
      let page = Math.round(offset / windowWidth);
      if (activeTab != page) {
        this.setData({ activeTab: page })
      }
      stv.offset = stv.windowWidth * page;
    }
    stv.tStart = false;
    this.setData({ stv: this.data.stv })
  },
  _updateSelectedPage(page) {
    let { tabs, stv, activeTab } = this.data;
    activeTab = page;
    this.setData({ activeTab: activeTab })
    stv.offset = stv.windowWidth * activeTab;
    this.setData({ stv: this.data.stv })
  },
  handlerTabTap(e) {
    console.log(e.currentTarget.dataset.index)
    this._updateSelectedPage(e.currentTarget.dataset.index);
    this.changeMsg()
    this.setData({
      scrollTop: 0
    });
  },
  changeMsg() {
    this.data.msg[this.data.activeTab].length < 1 && this.getMsg()

  },


  bindDownLoad: function () {
    if (this.data.isLoad) return
    let { page, orderNoMore } = this.data
    page[this.data.activeTab] += 1
    this.setData({
      page: page
    })
    !orderNoMore[this.data.activeTab] && this.getMsg("isDownLoad")

  },
  scroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  refresh: function (event) {
    this.setData({
      scrollTop: 0
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    options.type && this.setData({
      activeTab: parseInt(options.type)
    })
    try {
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            stv: {
              windowWidth: res.windowWidth,
              scrollHeight: res.windowHeight,
              lineWidth: res.windowWidth / this.data.tabs.length,
              offset: 0,
              tStart: false
            }
          })
        }
      });
      this.tabsCount = this.data.tabs.length;
    } catch (e) { }
  },
  toOrderDetail(e) {
    wx.navigateTo({
      url: "/pages/orderdetail/orderdetail?orderid=" + e.currentTarget.dataset.orderid,
    })
  },
  toPay(e) {
    app.showLoading("请求中")
    console.log(e.currentTarget.dataset.packageid)
    util.http({
      url: app.globalData.siteUrl + '/Main/ShoppingSinaPay/GetPayOrderInfo?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        orderid: e.currentTarget.dataset.orderid,
        wxapplet: '1',//小程序标识
        devicemac: wx.getStorageSync("SessionUserID"),
        payid: '20180929143591654986'
      },
      header: 1,
      successBack: (ret) => {
        let payorderinfo = JSON.parse(ret.data.Data.payorderinfo)
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data != null && ret.data.Data != "") {
          //调用小程序支付
          wx.requestPayment({
            'timeStamp': payorderinfo.TimeStamp,
            'nonceStr': payorderinfo.NonceStr,
            'package': payorderinfo.Package,
            'signType': payorderinfo.SignType == '' ? 'MD5' : payorderinfo.SignType,
            'paySign': payorderinfo.Sign,
            'success': function (res) {
              wx.redirectTo({
                url: '/pages/other/success_page/success_page',
              })
            },
            'fail': function (err) {
              let errMsg = ""
              if (err.errMsg.indexOf("cancel") != -1) {
                errMsg = "中途取消支付操作，请到订单列表支付"
              } else {
                errMsg = "支付失败: " + err.errMsg + "! 请到订单列表支付"
              }
              wx.showModal({
                title: '支付提示',
                content: errMsg,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {

                  }
                }
              })
            }
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  cancleOrder(e) {
    app.alerts("确认关闭订单?", {
      successBack: () => {
        util.http({
          url: app.globalData.siteUrl + '/Main/Member/CloseOrder?devicetype=5&uid=' + wx.getStorageSync('SessionUserID'),
          method: "POST",
          data: {
            uid: wx.getStorageSync('SessionUserID'),
            orderid: e.detail.target.dataset.orderid,
            formid: e.detail.formId
          },
          header: 1,
          successBack: (ret) => {
            if (ret && ret.data.success && ret.data.status == 1) {
              app.showtips("关闭成功")
              this.setData({
                msg: ["", "", "", "", ""],
                orderNoMore: [false, false, false, false, false],
                noMsg: [false, false, false, false, false]
              })
              this.getMsg()
              // let msg = this.data.msg
              // msg[this.data.activeTab].splice(e.currentTarget.dataset.idx, 1)
              // this.setData({
              //   msg: msg
              // })
            } else {
              app.promsg("关闭失败")
            }
          }
        })
      }
    })
  },
  getMsg(type) {
    this.setData({
      isLoad: true,
      isFirstLoaded: true
    })
    console.log({
      uid: wx.getStorageSync('SessionUserID'),
      currpage: this.data.page[this.data.activeTab],
      pagesize: this.data.pagesize,
      orderstatus: this.data.orderstatus[this.data.activeTab],
      wxprogram: 1
    })
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetOrderListJson?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        currpage: this.data.page[this.data.activeTab],
        pagesize: this.data.pagesize,
        orderstatus: this.data.orderstatus[this.data.activeTab]
      },
      loading_icon: type,
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret && ret.data.success) {
          let msg = this.data.msg
          let nomore = this.data.orderNoMore
          let noMsg = this.data.noMsg
          if (this.data.page[this.data.activeTab] == 1) {
            msg[this.data.activeTab] = ret.data.Data
            if (ret.data.Data.length < 1) {
              noMsg[this.data.activeTab] = true
            }
          } else {
            msg[this.data.activeTab] = [...msg[this.data.activeTab], ...ret.data.Data]
            if (ret.data.Data.length < this.data.pagesize) {
              nomore[this.data.activeTab] = true

            }
          }
          this.setData({
            msg: msg,
            isLoad: false,
            orderNoMore: nomore,
            noMsg: noMsg
          })

        } else {
          app.promsg(ret.data.err)
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
    CheckLoginStatus.checksession(() => {
      this.getMsg()
      this._updateSelectedPage(this.data.activeTab)
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