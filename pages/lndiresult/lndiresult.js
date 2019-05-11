// pages/lndiresult/lndiresult.js
const app = getApp()
const util = require("../../utils/util.js")
const sharebox = require('../../Component/sharebox/sharebox.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showshare: [false, true], // 分享弹窗
    isIphoneX: app.globalData.isIphoneX,
    options: {},        // 获取传递数据
    msg: {},         // 商品数据
    userData: {},       // 分享人的数据
    invalid: '',        // 1 已失效 0 已开奖
    byshare: false,     // 是否来自好友分享
    done: false,        // 是否已结束
    mydone: false       // 是否已结束 并且分享者是自己
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.ruid || options.scene) {
      // 扫二维码进来的
      if (options.scene) {
        var scene = decodeURIComponent(options.scene)
        return this.getScene(scene)
      }
      this.setData({
        options,
        invalid: options.invalid || '',
        byshare: true
      })
      this.getUserData()
    } else {
      wx.setNavigationBarTitle({
        title: '揭晓结果'
      })
      this.setData({
        options,
        invalid: options.invalid || ''
      })
      // 只是揭晓结果则隐藏转发功能
      wx.hideShareMenu()
    }
    this.getProData(options)
    console.log(options)
  },
  // 来自二维码，解析scene
  getScene(scene) {
    util.diz(scene, 76, 11, (ret) => {
      let scene = {}
      let str = ret.data.nValue
      let arr = str.split('A')
      scene.cloudid = arr[0]
      scene.ruid = arr[1]
      this.setData({
        options: scene,
        byshare: true
      })
      this.getUserData()
      this.getProData(scene)
    })
  },
  // 给好友助力
  getHelper(e) {
    console.log(e)
    // 简单校验
    let ruid = wx.getStorageSync("SessionUserID")
    if (this.data.options.ruid == ruid) {
      app.promsg('不能为自己助力')
      return
    }
    var that = this
    if (e.detail.userInfo) {
      let encryptedData = e.detail.encryptedData
      let iv = e.detail.iv
      let wxsessionkey = wx.getStorageSync("wxsessionkey")
      if (!wxsessionkey || !iv || !encryptedData) return app.promsg('助力失败，请后退重试')
      util.http({
        url: app.globalData.siteUrl + '/Marketing/Cloudbuy/RemainingShareCount?devicetype=5',
        method: 'post',
        data: {
          uid: this.data.options.ruid,
          cloudid: this.data.options.cloudid,
          temp: 1,
          encryptedData,
          iv,
          wxsessionkey,
          devicetype: 5
        },
        header: 1,
        successBack: (ret) => {
          console.log(ret)
          if (ret.data.success && ret.data.status == 1) {
            wx.showToast({
              title: "助力成功",
              icon: 'none',
              duration: 1000
            });
            setTimeout(function () {
              that.golndiana()
            }, 1500)
          }
        }
      })
    } else {
      wx.showToast({
        title: "助力好友失败",
        icon: 'none',
        duration: 2000
      });
    }
  },
  golndiana () {
		wx.reLaunch({
      url: '/pages/lndiana/lndiana',
    })
  },
  // 获取商品信息
  getProData(options) {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/GetOneCloudShoppingSet',
      data: {
        cloudid: options.cid || options.cloudid,
        userid: wx.getStorageSync("SessionUserID")
      },
      successBack: this.msgSuccessBack
    })
  },
  // 获取商品信息回调
  msgSuccessBack (ret) {
    console.log(ret)
    if (ret.data.success && ret.data.status == 1) {
      let data = ret.data.Data[0]
      this.setData({
        msg: data
      })
    } else {
      app.promsg(ret.data.err)
    }
  },
  // 获取用户信息
  getUserData() {
    console.log(this.data.options.ruid)
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/IsPayCloud?devicetype=5&uid=' + this.data.options.ruid,
      method: 'post',
      data: {
        uid: this.data.options.ruid,
        cloudid: this.data.options.cid || this.data.options.cloudid,
        buycount: this.data.options.buycount || 1
      },
      successBack: (ret) => {
        if (ret.data.success && ret.data.status == 1) {
          let data = ret.data.Data
          if (data.sharedes && data.sharedes.length > 0) {
            data.sharedes = JSON.parse(data.sharedes)
          }
          // data.remaining = 1
          this.setData({
            userData: data
          })
          // remaining 是分享需要次数
          console.log(this.data.userData)
          if (data.remaining < 1) {
            let ruid = wx.getStorageSync("SessionUserID")
            if (this.data.options.ruid == ruid) {
              this.setData({
                mydone: true
              })
            } else {
              this.setData({
                done: true
              })
            }
          }
        } else if (ret.data.success && ret.data.status == 20) {
          let data = ret.data.Data
          if (data.sharedes && data.sharedes.length > 0) {
            data.sharedes = JSON.parse(data.sharedes)
          }
          data.ispay = 1 //给个标记 表示已付款了
          // data.remaining = 1
          this.setData({
            userData: data
          })
          let ruid = wx.getStorageSync("SessionUserID")
          if (this.data.options.ruid == ruid) {
            this.setData({
              mydone: true
            })
          } else {
            this.setData({
              done: true
            })
          }
          
        } else {
          app.promsg(ret.data.err)
          setTimeout(() => {
            this.golndiana()
          }, 2000)
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

  },
  show() {
    this.setData({
      showshare: [true, true]
    })
  },
  closeshare() {
    this.setData({
      showshare: [false, true]
    })
  },
  // 分享朋友圈海报图片
  sharequan() {
    var that = this
    sharebox.sharequan(that, 3, 'lndiana')
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
  //关闭二次弹窗
  closesharebox: function () {
    this.setData({
      showtan: false
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this
    let cid = this.data.options.cloudid || this.data.options.cid
    let ruid = this.data.options.ruid
    return {
      title: this.data.userData.username + '@您，' + '邀您一起来抽奖',
      imageUrl: that.data.msg.proimg,
      path: `/pages/lndiresult/lndiresult?cloudid=${cid}&ruid=${ruid}`,
      success: function (res) {
        // 转发成功
        app.showtips('转发成功')
      },
      fail: function (res) {
        // 转发失败
        app.promsg('转发失败')
      }
    }
  },
  // 立即炫耀
  goToshare() {
    var that = this
    let cid = this.data.options.cloudid || this.data.options.cid
    return {
      title: that.data.msg.proname,
      imageUrl: that.data.msg.proimg,
      path: `/pages/groupbuy/groupbuy?cloudid=${cid}`,
      success: function (res) {
        // 转发成功
        app.showtips('转发成功')
      },
      fail: function (res) {
        // 转发失败
        app.promsg('转发失败')
      }
    }
  },
  // 活动结束按钮跳转
  gofinish() {
    if (this.data.done) {
      this.golndiana()
    }
    if (this.data.mydone) {
      let cid = this.data.options.cloudid || this.data.options.cid
      wx.navigateTo({
        url: `/pages/groupbuy/groupbuy?cloudid=${cid}&gopay=1`
      })
    }
  }
})