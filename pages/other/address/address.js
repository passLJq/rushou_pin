// pages/address/address.js
const app = getApp()
const util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adresslist:"",
    isreturn: "",//false代表订单确认页进来 true地址管理
  },
  toEdit(e){
    wx.navigateTo({
      url: '../edit_address/edit_address?addressid=' + (e.currentTarget.dataset.id || ""),
    })
  },
  todoSelect(e) {
    let data = JSON.stringify({
      addressID: e.currentTarget.dataset.id,
      uid: wx.getStorageSync("SessionUserID"),
      isdefult: 1,//0否1是
      name: this.data.adresslist[e.currentTarget.dataset.idx].name,//姓名
      areacode: this.data.adresslist[e.currentTarget.dataset.idx].areacode, //区域
      address: this.data.adresslist[e.currentTarget.dataset.idx].address,//详细地址
      phone: this.data.adresslist[e.currentTarget.dataset.idx].phone//电话
    })
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/InsertorUpdateAddress?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
      method: "POST",
      data: data,
      header: 1,
      loading_icon: !this.data.isreturn? 1: '',
      successBack: (ret)=> {
        if(ret && ret.data.status == 1) {
          this.data.isreturn && wx.navigateBack({
            delta: 1
          })
          if(!this.data.isreturn && e.currentTarget.dataset.type === "btn") {
            let { adresslist} = this.data
            adresslist.forEach((item)=> {
              item.isdefault = false
            })
            adresslist[e.currentTarget.dataset.idx].isdefault = true
            this.setData({
              adresslist: adresslist
            })
          }
        }
      }
    })
  },
  bindAdressList:function(){
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetAddressList?devicetype=5',
      data: {
        uid: wx.getStorageSync("SessionUserID")
      },
      header: 1,
      successBack: (ret)=> {
        if(ret && ret.data.status == 1) {
          this.setData({
            adresslist: ret.data.Data
          })
        }else {
          this.setData({
            adresslist: ""
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.addressId){
      this.setData({
        isreturn: options.addressId
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {

    var that = this
    that.bindAdressList()
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