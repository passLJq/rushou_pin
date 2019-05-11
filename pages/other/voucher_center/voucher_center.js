// pages/company_coupon/company_coupon.js
const app = getApp()
const util = require("../../../utils/util.js")
const CheckLoginStatus = require("../../../utils/CheckLoginStatus.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasGet: [],
    unGet: [],
    // companyid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //读单独商家的优惠券
    if (options.comid){
      this.setData({
        comid: options.comid
      })
      this.getcomid()
    }else{
      this.getComMsg()
    }
  },
  // 获取优惠券数据
  // getMsg() {
  //   // 获取平台券
  //   util.http({
  //     url: app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson?devicetype=5',
  //     data: {
  //       uid: wx.getStorageSync('SessionUserID'),
  //       ispaltform: 1
  //     },
  //     header: 1,
  //     successBack: ret => {
  //       if (ret.data.success && ret.data.status == 1) {
  //         var arr = ret.data.Data
  //         this.getComMsg(arr)
  //       } else {
  //         app.promsg(ret.data.err)
  //       }
  //     }
  //   })
  // },
  // 获取商家优惠券数据
  getcomid(){
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        comid: this.data.comid,
        ispaltform: 3          // 3是包括商家券与平台券
      },
      header: 1,
      successBack: ret => {
        // console.log(ret)
        let data = []
        if (ret.data.success && ret.data.status == 1) {
          if (ret.data.Data.length) {
            data = ret.data.Data
          }
        } else {
          app.promsg(ret.data.err)
        }
        if (data.length) {
          var hasGet = []
          var unGet = []
          data.forEach(item => {
            // isover 表示总数领取完了 或领取次数剩余0了 就加入已领取列表
            if (!item.isover && (item.eachamount - item.getnum) > 0 && item.couponType != 2 && item.couponType != 3) {
              item.time = this.getTime(item.starttime, item.endtime)
              item.state = this.getState(item.endtime)
              unGet.push(item)
            } else {
              item.time = this.getTime(item.starttime, item.endtime)
              item.state = this.getState(item.endtime)  // 1 即将过期 2 已过期  0 正常
              if (item.isget) {
                if (item.getnum > 1) {
                  // 获取的数量大于1则遍历
                  for (let i = 0; i < item.getnum; i++) {
                    hasGet.push(item)
                  }
                } else {
                  hasGet.push(item)
                }
              }
            }
          })
          if (!hasGet.length) hasGet = ''
          if (!unGet.length) unGet = ''
          this.setData({
            hasGet,
            unGet
          })
        }
      }
    })
  },
  getComMsg() {
    util.http({
			url: app.globalData.siteUrl + '/Marketing/Coupon/GetGBCouponListJson',
			data: {
				uid: wx.getStorageSync('SessionUserID'),
				ispaltform: '0',
				comid: ''
			},
      successBack: ret => {
				this.couponBack(ret)
      }
    })
		util.http({
			url: app.globalData.siteUrl + '/Marketing/Coupon/GetGBCouponListJson',
			data: {
				uid: wx.getStorageSync('SessionUserID'),
				ispaltform: '1',
				comid: ''
			},
			successBack: ret => {
				this.couponBack(ret)
			}
		})
  },
	couponBack(ret) {
		let data = []
		if (ret.data.success && ret.data.status == 1) {
			if (ret.data.Data.length) {
				data = ret.data.Data
			}
		} else {
			app.promsg(ret.data.err)
		}
		if (data.length) {
			var hasGet = this.data.hasGet || []
			var unGet = this.data.unGet || []
			data.forEach(item => {
				item.time = this.getTime(item.starttime, item.endtime)
				item.state = this.getState(item.endtime)  // 1 即将过期 2 已过期  0 正常
				// isover 表示总数领取完了 或领取次数剩余0了 就加入已领取列表
				if (!item.isover && (item.eachamount - item.getnum) > 0 && item.couponType != 2 && item.couponType != 3) {
					if (item.getnum > 0) {
						for (let k = 0; k < item.getnum; k++) {
							hasGet.push(item)
						}
					}
					unGet.push(item)
				} else {
					if (item.getnum > 1) {
						// 获取的数量大于1则遍历
						for (let i = 0; i < item.getnum; i++) {
							hasGet.push(item)
						}
					} else {
						hasGet.push(item)
					}
				}
			})
			if (!hasGet.length) hasGet = ''
			if (!unGet.length) unGet = ''
			console.log(hasGet)
			this.setData({
				hasGet,
				unGet
			})
		}
	},
  // 获取时间格式
  getTime(t1, t2) {
    var str1 = t1.split(' ')[0]
    var str2 = t2.split(' ')[0]
    var str3 = str1.split('.')
    var str4 = str2.split('.')
    var str5 = str3[0] + '年' + str3[1] + '月' + str3[2] + '日' + '-' + str4[0] + '年' + str4[1] + '月' + str4[2] + '日'
    return str5
  },
  getState(time) {
    var t1 = Date.now()
    var t2 = Date.parse(new Date(time))
    // console.log(time)
    var t3 = t2 - t1
    if (t3 > 0 && t3 <= 432000000) {
      return 1
    } else if (t3 <= 0) {
      return 2
    }
    return 0
  },
  checkLogin(e) {
    CheckLoginStatus.checksession(() => {
      wx.hideLoading()
      var event = e
      this.getCoupon(event)
    })
  },
  // 领取优惠券
  getCoupon(e) {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Coupon/ReceiveCoupon?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        couponid: e.currentTarget.dataset.couponid
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        var idx = e.currentTarget.dataset.index
        if (ret && ret.data.success && ret.data.status == 1) {
          app.showtips("领取成功")
					let unGet = this.data.unGet || []
					let hasGet = this.data.hasGet || []
          let data = unGet[idx]
          data.getnum += 1
          if ((data.eachamount - data.getnum) <= 0) {
            unGet.splice(idx, 1)
          } else {
            unGet[idx] = data
          }
					hasGet.push(data)
          this.setData({
            hasGet,
            unGet
          })
        } else if (ret.data.status == 5) {
          app.promsg('该优惠券已全部领完了')
          // 总数为零
          let { hasGet, unGet } = this.data
          let data = unGet[idx]
          unGet.splice(idx, 1)
          hasGet.push(data)
          this.setData({
            hasGet,
            unGet
          })
        }
        else {
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
		this.setData({
			unGet: [],
			hasGet: [],
		})
    if (this.data.comid){
      this.getcomid()
    }else{
      this.getComMsg()
    }
    // this.getMsg()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})