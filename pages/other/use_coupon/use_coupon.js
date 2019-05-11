// pages/other/use_coupon/use_coupon.js
const app = getApp()
const util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comfirmMsg: "",//确认页过来的数据
    useableMsg: [], //可用数据
    unuseableMsg: [],//不可用数据
    noMsg: false, //首次没有数据
    useTimeOver: [],//可使用的优惠券是否显示即将过期
    unuseTimeOver: [],//不可使用的优惠券是否显示即将过期
    allSelect: 0,//不使用选择器
    itemSelect: [],//使用选择器
  },
  selectItem(e) {
    let idx = e.currentTarget.dataset.idx
    let { allSelect, itemSelect, useableMsg} = this.data
    
    if(idx === "a") {//不使用
      itemSelect.fill(0)
      allSelect = (allSelect ? 0 : 1)
    }else {//使用
      allSelect = 0
      for(let i in itemSelect) {
        if (useableMsg[idx].isplatform) {//平台券
          if (Number(i) === Number(idx)) {
            itemSelect[i] = (itemSelect[i] ? 0 : 1)
          }else {
            if (useableMsg[i].isplatform) {
              itemSelect[i] = 0
            }
          }
        }else {//商家券
          if (Number(i) === Number(idx)) {
            itemSelect[i] = (itemSelect[i] ? 0 : 1)
          } else {
            console.log(useableMsg[i])
            if (!useableMsg[i].isplatform) {
              itemSelect[i] = 0
            }
          }
        }

      }
    }
    this.setData({
      allSelect,
      itemSelect
    })
  },
  toComfirm() {
    let userCouponId = []
    let useCouponPrice = 0
    let { itemSelect, useableMsg } = this.data
    for (let i in itemSelect) {
      if (itemSelect[i]) {
        userCouponId.push(useableMsg[i].usercouponid)
        useCouponPrice += Number(useableMsg[i].facevalue)
      }
    }
    wx.setStorageSync("userCouponId", userCouponId)
    wx.setStorageSync("useCouponPrice", useCouponPrice)
    wx.navigateBack({
      delta: 1
    })
  },
  getYouHuiEndTime(name, endTime, idx) {
    var newEndTime = endTime.replace(/[ :.]/g, ',').split(",")
    var ey = newEndTime[0], en = newEndTime[1] - 1, ed = newEndTime[2], eh = newEndTime[3], em = newEndTime[4], es = newEndTime[5];
    var endGetTime = new Date(ey, en, ed, eh, em, es).getTime()

    var time = Math.floor((endGetTime - Date.now()) / 1000)
    var minute, hour, day, second;
    day = Math.floor(time / 60 / 60 / 24) < 10 ? '0' + Math.floor(time / 60 / 60 / 24) : Math.floor(time / 60 / 60 / 24);
    let useTimeOver = []
    if (day < 5) {
      useTimeOver = true
    } else {
      useTimeOver = false
    }
    if (name === "useableMsg") {
      this.setData({
        useTimeOver: useTimeOver
      })
    }else {
      this.setData({
        unuseTimeOver: useTimeOver
      })
    }

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
      url: app.globalData.siteUrl + '/Marketing/Coupon/GetUseableCouponListJson?devicetype=5&uid=' + wx.getStorageSync('SessionUserID'),
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        queryinput: this.data.comfirmMsg,
        isgb: 'true'
      },
      method: "POST",
      loading_icon: state,
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        let { useableMsg, unuseableMsg, noMsg, itemSelect, allSelect } = this.data
        if (ret && ret.data.success && ret.data.status == 1) {
          if(ret.data.Data.useable.length > 0) {
            useableMsg = [...useableMsg, ...ret.data.Data.useable]
          }
          if (ret.data.Data.unuseable.length > 0) {
            unuseableMsg = [...unuseableMsg, ...ret.data.Data.unuseable]
          }
        } else {
          app.promsg(ret.err)
        }
        if (useableMsg.length < 1 && unuseableMsg.length < 1) {
          noMsg = true
        }
        useableMsg.forEach((item, index) => {
          let endTime = item.endtime
          let userCouponId = wx.getStorageSync("userCouponId")
          this.getYouHuiEndTime("useableMsg", endTime, index)
          if (!userCouponId || userCouponId.length < 1) {
            // itemSelect.push(0)
            itemSelect[index] = 0
            allSelect = 1
          }else {
            itemSelect[index] = 0
            for (let i in userCouponId) {
              console.log(item.usercouponid)
              console.log(userCouponId[i])
              if (item.usercouponid == userCouponId[i]) {
                // itemSelect.push(1)
                itemSelect[index] = 1
                allSelect = 0
              }
            }
          }
          console.log(1)
        })
        unuseableMsg.forEach((item, index) => {
          let endTime = item.endtime
          this.getYouHuiEndTime("unuseableMsg", endTime, index)
        })
        this.setData({
          unuseableMsg,
          useableMsg,
          noMsg,
          itemSelect,
          allSelect
        })
      }
    })
    let timer = setTimeout(() => {
      wx.stopPullDownRefresh()
      clearTimeout(timer)
      timer = null
    }, 1500)


  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.isComfirm) {
      this.setData({
        comfirmMsg: wx.getStorageSync("isComfirm")
      })
      wx.setStorageSync("isComfirm", "")
    }
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