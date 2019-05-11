const app = getApp()
const util = require("../../utils/util.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hasGet: {
      type: Array,
      value: {},
      observer: function (newVal, oldVal) {
        if (!newVal) return
        this.setData({
          hasGet: newVal
        })
      }
    },
    unGet: {
      type: Array,
      value: {},
      observer: function (newVal, oldVal) {
        if (!newVal) return
        this.setData({
          unGet: newVal
        })
      }
    },
    gbid: {
      type: String,
      value: '',
      observer: function (newVal, oldVal) {
        if (!newVal) return
        this.setData({
          gbid: newVal
        })
      }
    },
    pid: {
      type: String,
      value: '',
      observer: function (newVal, oldVal) {
        if (!newVal) return
        this.setData({
          pid: newVal
        })
      }
    },
    companyid: {
      type: String,
      value: '',
      observer: function (newVal, oldVal) {
        if (!newVal) return
        this.setData({
          companyid: newVal
        })
      }
    },
    refresh: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
        if (newVal) {
          this.getMsg()
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    hasGet: '',           // 优惠券列表数据
    unGet: '',            // 未领取优惠券列表数据
    companyid: '',        // 商家id
    pid: '',              // 商品id
    gbid: '',             // 拼团id
  },
  ready() {
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 关闭
    close() {
      this.triggerEvent('close')
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
            let {hasGet, unGet} = this.data
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
            let {hasGet, unGet} = this.data
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
    getMsg() {
      if (this.data.gbid) {
        this.getGbCou()
      } else if (this.data.pid) {
        this.getProCou()  // 有pid则读取商品优惠券
      } else {
        this.getComCou()  // 没有则读取平台与商家优惠券
      }
    },
    // 获取拼团券
    getGbCou() {
      util.http({
        url: app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson',
        data: {
          uid: wx.getStorageSync('SessionUserID'),
          ispaltform: 3,
          gbid: this.data.gbid,
          // gbid: '181114111402677383'
          isgb:'true',
          comid: this.data.companyid
        },
        successBack: ret => {
          console.log(ret)
          if (ret.data.success && ret.data.status == 1) {
            let arr = []
            let data = ret.data.Data
            if (data.length) {
              this.screenCoupon(data)
            }
          }
        }
      })
    },
    // 获取商品优惠券
    getProCou() {
      util.http({
        url: app.globalData.siteUrl + '/Marketing/Coupon/GetCompanyPlatformCoupon',
        data: {
          CompanyID: this.data.companyid,
          uid: wx.getStorageSync('SessionUserID'),
          proId: this.data.pid
        },
        header: 1,
        successBack: ret => {
          if (ret.data.success && ret.data.status == 1) {
            let arr = []
            let CompanyData = ret.data.CompanyData
            let Platform = ret.data.Platform
            if (CompanyData.length) {
              CompanyData.forEach(item => {
                if (item.prolimit == 1) {
                  arr.push(item)
                }
              })
            }
            if (Platform.length) {
              Platform.forEach(item => {
                if (item.prolimit == 1) {
                  arr.push(item)
                }
              })
            }
            if (arr.length) {
              this.screenCoupon(arr)
            }
          }
        }
      })
    },
    // 获取店铺优惠券
    getComCou() {
      utils.http({
        url: app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson?devicetype=5',
        data: {
          uid: wx.getStorageSync('SessionUserID'),
          comid: this.data.companyid,
          ispaltform: 3
        },
        header: 1,
        successBack: ret => {
          let data = ''
          if (ret.data.success && ret.data.status == 1) {
            data = ret.data.Data
          } else {
            app.promsg(ret.data.err)
          }
          if (data.length) {
            this.screenCoupon(data)
          }
        }
      })
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
    // 优惠券筛选
    screenCoupon(arr) {
      var that = this
      var hasGet = []
      var unGet = []
      arr.forEach(item => {
        // isover 表示总数领取完了 或领取次数剩余0了 就加入已领取列表  couponType 为 2是新会员 3是新店主
        if (!item.isover && (item.eachamount - item.getnum) > 0 && item.couponType != 2 && item.couponType != 3) {
          item.time = that.getTime(item.starttime, item.endtime)
          item.state = that.getState(item.endtime)
          unGet.push(item)
          if (item.getnum) {
            if (item.getnum > 1) {
              // 获取的数量大于1则遍历
              for (let i = 0; i < item.getnum; i++) {
                hasGet.push(item)
              }
            } else {
              hasGet.push(item)
            }
          }
        } else {
          item.time = that.getTime(item.starttime, item.endtime)
          item.state = that.getState(item.endtime)
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
      that.setData({
        hasGet,
        unGet
      })
    },
  }
})