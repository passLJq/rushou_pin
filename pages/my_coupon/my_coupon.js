// pages/other/mycoupon/mycoupon.js
const app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navList: ["未使用", "已使用", "已过期"], //slide名字
    slide: 0, //对应navList下标
    page: [1, 1, 1], //第几页
    pagesize: [10, 10, 10], //每一页的数量
    listMsg: [
      [],
      [],
      []
    ], //数据
    noMsg: [false, false, false], //首次没有数据
    useTimeOver: [],//是否显示即将过期
  },
  changeSlide(e) {
    this.setData({
      slide: parseInt(e.currentTarget.dataset.idx)
    })
    this.data.listMsg[this.data.slide].length < 1 && this.getMsg()

  },
  // toCouponCenter() {
  //   wx.navigateTo({
  //     url: '/pages/other/voucher_center/voucher_center',
  //   })
  // },
  toIndex() {
		wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  getYouHuiEndTime(endTime, idx) {
    var newEndTime = endTime.replace(/[ :.]/g, ',').split(",")
    var ey = newEndTime[0], en = newEndTime[1] - 1, ed = newEndTime[2], eh = newEndTime[3], em = newEndTime[4], es = newEndTime[5];
    var endGetTime = new Date(ey, en, ed, eh, em, es).getTime()

    var time = Math.floor((endGetTime - Date.now()) / 1000)
    var minute, hour, day, second;
    day = Math.floor(time / 60 / 60 / 24) < 10 ? '0' + Math.floor(time / 60 / 60 / 24) : Math.floor(time / 60 / 60 / 24);
    let useTimeOver = this.data.useTimeOver
    if (day < 5) {
      useTimeOver[idx] = true
    }else {
      useTimeOver[idx] = false
    }
    this.setData({
      useTimeOver
    })
  },
  getMsg(state) {
    let sta = 1
    let isexpire = undefined
    if (this.data.slide === 0 || this.data.slide === 1) {
      sta = this.data.slide + 1
    } else if (this.data.slide === 2) {
      sta = 1
      isexpire = 2
    }
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Coupon/GetUserCouponListJson?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        sta: sta, //状态 0-未激活 1-未使用 2-已使用
        isexpire: isexpire //sta == "1" && isexpire == 1-未激活的卷，sta == "1" && isexpire == 2) 未使用过期的卷，sta == "1"未使用未过期的卷
      },
      loading_icon: state,
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        let noMsg = this.data.noMsg
        let listMsg = this.data.listMsg
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
          listMsg[this.data.slide] = [...listMsg[this.data.slide], ...ret.data.Data]
        } else {
          app.promsg(ret.err)
        }
        if (this.data.page[this.data.slide] === 1 && ret.data.Data.length < 1) {
          noMsg[this.data.slide] = true
        } else if (ret.data.Data.length < this.data.pagesize[this.data.slide] && this.data.page[this.data.slide] !== 1) {}
        if (this.data.slide === 0) {
          ret.data.Data.forEach((item, index) => {
            let endTime = item.endtime
            this.getYouHuiEndTime(endTime, index)
          })
        }
        this.setData({
          listMsg: listMsg,
          noMsg: noMsg
        })
        console.log(this.data.listMsg)
      }
    })
    let timer = setTimeout(() => {
      wx.stopPullDownRefresh()
      clearTimeout(timer)
      timer = null
    }, 1500)


  },
  refreshMsg() {
    let {
      page,
      noMsg,
      listMsg
    } = this.data
    page = [1, 1, 1]
    noMsg = [false, false, false]
    listMsg = [
      [],
      [],
      []
    ]
    this.setData({
      page,
      noMsg,
      listMsg
    })
    this.getMsg()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getMsg()
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