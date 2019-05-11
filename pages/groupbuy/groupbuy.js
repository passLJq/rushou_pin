// pages/groupbuy/groupbuy.js
var app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
const sharebox = require('../../Component/sharebox/sharebox.js')
const WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    imgUrls: [],
    price: 0.00,             // 现价
    oldPrice: 0.00,          // 原价
    gbnum: 0,                // x人团
    msg: {},                 // 商品数据
    groupBuyList: {},        // 商品拼团信息
    productDetail: [],       // 商品详情图片
    markShow: true,          // 是否显示遮罩 

    showPt: true,            // 是否显示拼团弹窗
    ptData: {},              // 拼团数据
    ptDetailData: '',        // 拼团详细信息
		specData: '',
		skutext: '',
    skuBoxBottom: false,     // 显示规格弹窗
    buyCounts: 1,            // 购买数量
    buyPrice: 0.00,          // 单价
		ssprice: 0.00,           // 规格对应的售价
    rushbuyid: '',
    buyGroup: false,         // 弹窗显示拼团按钮

    bindBottom: false,       // 显示保障信息弹窗
    timer: [],               // 拼团倒计时的计时器
    countDownTime: [],       // 倒计时时间
    options: {},             // 当前传递的数据
    showshare: [false, true],// 分享弹窗
		showtan: false,					 //分享后的第二个弹窗
    currentIndex: 0,         // 当前轮播的页码
    // 以下来自夺宝新增
    isduobao: false,         // 跳转来自夺宝
    showNum: false,          // 显示夺宝数量选择 
    shareNum: 1,             // 需要分享的次数
    lndianaNum: 1,           // 夺宝购买数量
    showHelper: true,
    gopay: false,            // 是否来自分享助力
    hasJoin: false,          // 是否已参与了该抽奖
    isIphoneX: app.globalData.isIphoneX,         // 是否为iphoneX
    uid: '',
		fxshopid: '',
    showCoupon: false,       //显示优惠券
    hasGet: '',              // 已领优惠券数据
    unGet: '',               // 未领优惠券数据
		groupCount: {						 // 拼团商品活动的倒计时
			day: 0,
			hour: '00',						 // 时
			minute: '00',					 // 分
			second: '00',					 // 秒
			isDone: false,				 // 活动是否结束
			show: false,					 // 控制显示倒计时和文案 （一开始进来时暂不显示倒计时，计时器跑完一次再显示）
			text: ''							 // 文案
		},
		groupTimer: null,				 // 拼团商品计时器
		gbearn: 0,							 // 拼团赚
		proearn: 0,							 // 直接买赚
		userMsg: '',
		showTips: false,				 // 显示参团提示
  },
  onSlideChangeEnd (e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      uid: wx.getStorageSync("SessionUserID"),
			fxshopid: wx.getStorageSync("fxshopid"),
    })
		if (options.registerId) {
			wx.setStorageSync('registerId', options.registerId)
		}
    // 扫二维码进来的
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      var data = {}
      console.log(scene)
      // .,开头表示是分享抽奖
      if (scene.indexOf('.,') == 0) {
        data.cloudid = scene.substring(2)
        this.setData({
          isduobao: true,
          options: data
        })
        this.hasJoin()
        this.getlndianaProMsg(data)
        return
			} else if (scene.indexOf('A') == 0) {
				// 扫拼团详情海报
				util.diz(scene.substr(1),76,11, ret => {
					let data = ret.data.nValue.split('A')
					wx.setStorageSync('registerId', data[0])
					this.setData({
						options: {
							gbid: data[1]
						}
					})
					this.getGroupBuyList(this.data.options)
				})
				return
			} else {
        // 不是 ., 开头则是拼团详情
        data.gbid = scene 
        this.setData({
          options: data
        })
        this.getGroupBuyList(data)
        return 
      }
    }
    this.setData({
      options,
      oldPrice: options.oldPrice || 0.00
    })
    // 有cloudid表示是分享夺宝的商品详情
    if (options.cloudid) {
      this.setData({
        isduobao: true
      })
    // 表示来自助力页面的立即付款按钮
    if (options.gopay) {
      this.setData({
        gopay: true
      })
    } 
      this.hasJoin()
      this.getlndianaProMsg(options) // 获取商品信息
      return
    }
    this.getGroupBuyList(options) // 获取商品拼团信息+倒计时
  },
  // 获取商品拼团信息
  getGroupBuyList(options) {
    util.http({
      url: app.globalData.siteUrl + '/Main/Main/GetGroupBuyProJson',
      data: {
        gbid: options.gbid,
        uid: wx.getStorageSync("SessionUserID"),
        ogid: '',
				fxshopid: wx.getStorageSync("fxshopid")
      },
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
          this.setData({
            price: ret.data.Data.gbprice,
            gbnum: ret.data.Data.gbnum,
            groupBuyList: ret.data.Data,
						gbearn: ret.data.Data.gbearn
          })
          this.getProductMsg(ret.data.Data.gbproid) // 获取商品信息
          this.getCouponMsg()  // 读取优惠券数据
					this.getCount()		// 计算活动时间
          var that = this
          console.log(ret.data.Data.gblist)
          for (let i = 0; i < ret.data.Data.gblist.length; i++) {
            let time = ret.data.Data.gblist[i].ts - ret.data.Data.gblist[i].tpgap
            console.log(time)
            if (time < 0) continue
            that.countLastTimes(time, i)
          }
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
	getCount() {
		var start = this.data.groupBuyList.starttime
		var end = this.data.groupBuyList.endtime
		var nowtime = Date.now()
		var starttime = Number(Number(start) - Number(nowtime)) / 1000
		var endtime = Number(Number(end) - Number(nowtime)) / 1000
		if (starttime > 0) {
			this.count(starttime, 1)
		} else {
			this.count(endtime, 2)
		}
		
		// console.log(569090.003)
		// this.count(569090, 2)
	},
	// 计算活动结束倒计时
  count(times, index) {
		var show = true
		var timetick = times
    var that = this
		var idx = index
		// clearInterval(that.data.groupTimer)
		this.setData({
			groupTimer: setInterval(function () {
				var day = 0
				var hour = 0
				var minute = 0
				var second = 0
				var isDone = false  // 活动是否已结束
				var text = ''
				if (idx == 1) {
					text = '距离活动开始'
				} else {
					text = '距离活动结束'
				}
				if (timetick > 0) {
					day = Math.floor(timetick / (60 * 60 * 24))
					hour = Math.floor(timetick / (60 * 60)) - (day * 24)
					minute = Math.floor(timetick / 60) - (day * 24 * 60) - (hour * 60)
					second = Math.floor(timetick) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60)
				}

				// if (day <= 9) day = '0' + day
				hour = (Number(day) * 24) + Number(hour)
				if (hour <= 9) hour = '0' + hour
				if (minute <= 9) minute = '0' + minute
				if (second <= 9) second = '0' + second

				if (timetick <= 0) {
					if (idx == 1) {
						clearInterval(that.data.groupTimer)
						that.getCount()
					} else {
						clearInterval(that.data.groupTimer)
						isDone = true
					}
				}
				that.setData({
					groupCount: {
						day,
						hour,
						minute,
						second,
						isDone,
						show,
						text
					}
				})
				timetick--
				// console.log(1)
			}, 1000)
		})
  },
  // 获取拼团商品信息
  getProductMsg(gbproid) {
    util.http({
      url: app.globalData.siteUrl + '/Main/Main/GetProductDetailJson',
      data: {
        productId: gbproid,
        gbid: this.data.options.gbid,
        userid: wx.getStorageSync("SessionUserID"),
				fxshopid: wx.getStorageSync('fxshopid')
      },
      // header: 1,
      successBack: this.msgSuccessBack
    })
  },
  // 拼团商品信息成功回调函数
  msgSuccessBack (ret) {
    if (ret.data.success && ret.data.status ==1) {
      const data = ret.data.Data
      let desc = data.description
       WxParse.wxParse('productDetail', 'html', desc, this, 0);
      // console.log(url)
      this.setData({
        msg: data,
        nowStock: data.stock,
        minCounts: data.minbuycount,
        maxCounts: data.maxbuycount,
        imgUrls: JSON.parse(data.album).piclist,
        oldPrice: data.saleprice,
        ssprice: data.saleprice,
				proearn: data.commPrice
      })
      // 读取规格
      // console.log(this.data.msg.openspec)
      if (this.data.msg && this.data.msg.openspec) {
        this.getSpec()
      }
    } else {
      app.promsg(ret.data.err)
    }
    
  },
  // 读取规格 设置原价
  getSpec(gbproid) {
    // console.log(111)
    util.http({
      url: app.globalData.siteUrl + '/Main/Main/GetProductSkuJson',
      data: {
        productId: this.data.msg.productid,
        fxshopid: wx.getStorageSync('fxshopid'),
				gbid: this.data.options.gbid
      },
      successBack: (ret) => {
        console.log(ret)
        var that = this
        let data = ret.data.Data
        let bus = ''
        //拼团读另一个规格
        if (this.data.buyGroup) {
          bus = ret.data.Data.gbsku[0].gbskuPrice.toFixed(2)
        } else {
          bus = ret.data.Data.sku[0].saleprice.toFixed(2)
				}
				var idx = 0		// 获取拼团价最低的规格索引 默认为0
        if (ret.data.Data.sku.length > 1) {
					var dsku = ret.data.Data.gbsku
					var p = dsku[0].gbskuPrice		// 获取最低的拼团规格价 默认为第一个拼团规格价
					dsku.map((item, index) => {
						if (item.gbskuPrice < p) {
							p = item.gbskuPrice
							idx = index
						}
					})
				}
        this.setData({
          specData: ret.data.Data,
          buyPrice: bus,
					skutext: ret.data.Data.sku[idx].skutext,
          price: ret.data.Data.gbsku[idx].gbskuPrice,
          // oldPrice: ret.data.Data.sku[0].saleprice,
          ssprice: ret.data.Data.sku[idx].marketprice,
					gbearn: ret.data.Data.gbsku[idx].gbearn,
					proearn: this.data.msg.skuobj[idx].savemoney
        })
      }
    })
  },
  // 计算剩余时间
  countLastTimes (time, index) {
    let {timer, countDownTime} = this.data
    let t = time
    let idx = index
    var that = this
    timer[index] = setInterval(() => {
      t -= 1
      if (t < 0) {
        let {groupBuyList} = this.data
        groupBuyList.gblist[idx] = null
        this.setData({
          groupBuyList
        })
      }
      let days = Math.floor(t / 60 / 60 / 24)
      let hours = Math.floor(t / 60 / 60 % 24)
      let minutes = Math.floor(t / 60 % 60)
      let seconds = Math.floor(t % 60)

      minutes = minutes < 10 ? '0' + minutes : minutes
      seconds = seconds < 10 ? '0' + seconds : seconds
      // 将计算得出的剩余时间塞入countDownTime数组 在wx-for中通过index获取对应的剩余时间
      countDownTime[idx] = ''
      if (days) {
        countDownTime[idx] += days + '天'
      }
      if (hours) {
        countDownTime[idx] += hours + ':'
      }
      if (minutes) {
        countDownTime[idx] += minutes + ':'
      }
      countDownTime[idx] +=  seconds
      that.setData({
        countDownTime
      })
    }, 1000)
  },
  // 跳转拼团详情
  goGroupDetail (e) {
    let isingroup = e.currentTarget.dataset.isingroup
    // 已参团的直接跳转详情
    if (isingroup) {
      wx.navigateTo({
        url: '/pages/group_detail/group_detail?orderid=' + e.currentTarget.dataset.orderid,
      })
      return 
    }
    let bool = false
    // 已有拼团 不能继续参团
    if (!isingroup) {
      let gblist = this.data.groupBuyList.gblist
      gblist.forEach((item) => {
        if (item.isingroup) {
          bool = true
        }
      })
    }
    if (bool) {
      return app.promsg('您有尚未结束的拼团活动')  
    }
    
    var that = this
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        // this.buygroup(1)
        this.setData({
          buyGroup: true,
          showPt: true
        })
        this.showSku()
        wx.hideLoading()
      })
    } else {
      // that.buygroup(1)
      this.setData({
        showPt: true,
        buyGroup: true
      })
      this.showSku()
    }
  },
  // //立即购买
  // buyNow(){
  //   var that = this
  //   if (!wx.getStorageSync('SessionUserID')) {
  //     app.showLoading("登录中")
  //     CheckLoginStatus.checksession(() => {
  //       // 有规格数据就规格弹窗
  //       this.setData({
  //         buyGroup: false,
  //         ssprice: that.data.msg.marketingprice
  //       })
  //       this.showSku()
  //       wx.hideLoading()
  //     })
  //   } else {
  //     // 有规格数据就规格弹窗
  //     this.setData({
  //       buyGroup: false,
  //       ssprice: that.data.msg.marketingprice
  //     })
  //     this.showSku()
  //   }
  // },
  // //立即购买校检
  // buyNowFunc() {
  //   // console.log(this.data.skuid)
  //   // console.log(this.data.buyCounts)
  //   // return
  //   var that = this
  //     //普通商品校检
  //   let data = {
  //       uid: wx.getStorageSync('SessionUserID'),
  //       pid: that.data.msg.productid,
  //       buycount: 1,
  //       skuid: that.data.spec ? that.data.skuid : that.data.groupBuyList.gbskuid
  //     }
  //     util.http({
  //       url: app.globalData.siteUrl + '/Main/Shopping/CheckProductBuyStatus?devicetype=5',
  //       data: data,
  //       header: 1,
  //       successBack: that.CheckProductBuyStatus
  //     })
  // },
  // //校检成功回调
  // CheckProductBuyStatus(ret) {
  //   if (ret) {
  //     if (ret.data.status == 1) {
  //       var that = this
  //       let way = 'buynow'
  //       if (that.data.spec) {
  //         wx.navigateTo({
  //           url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + this.data.skutext + '&skuid=' + this.data.skuid + '&skuprice=' + this.data.buyPrice + '&pid=' + this.data.msg.productid + '&companyid=' + this.data.msg.companyid
  //         })
  //       } else {
  //         wx.navigateTo({
  //           url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + this.data.groupBuyList.gbskutext + '&skuid=' + this.data.groupBuyList.gbskuid + '&skuprice=' + this.data.buyPrice + '&pid=' + this.data.msg.productid + '&companyid=' + this.data.msg.companyid
  //         })
  //       }
  //     } else {
  //       app.alerts(ret.data.err, { showCancel: true });
  //     }
  //   } else {
  //     app.promsg(err.msg);
  //   }
  //   wx.hideLoading()
  // },
  // //拼团购买
  // groupbuy(){
  //   var that = this
  //   if (!wx.getStorageSync('SessionUserID')) {
  //     app.showLoading("登录中")
  //     CheckLoginStatus.checksession(() => {
  //       // 有规格数据就弹窗 没有就直接支付
  //       this.setData({
  //         buyGroup: true,
  //         ssprice: that.data.sku[0].saleprice
  //       })
  //       this.showSku()
  //       wx.hideLoading()
  //     })
  //   } else {
  //     // 有规格数据就弹窗 没有就直接支付
  //     this.setData({
  //       buyGroup: true
  //     })
  //     this.showSku()
  //   }
  //   // 修改规格弹窗的原价价格 ╮(╯▽╰)╭
  //   if (this.data.spec) {
  //     if (this.data.skuid) {
  //       this.data.sku.map(item => {
  //         if (item.skuid == this.data.skuid) {
  //           that.setData({
  //             ssprice: item.saleprice
  //           })
  //         }
  //       })
  //     } else {
  //       that.setData({
  //         ssprice: that.data.sku[0].saleprice
  //       })
  //     }
  //   } else {
  //     that.setData({
  //       ssprice: that.data.msg.saleprice
  //     })
  //   }
  // },
  // //拼团购买校检
  // buygroup(type){
  //   var that=this
  //   var groupBuyList = that.data.groupBuyList
  //   if (groupBuyList.gbproid == null || groupBuyList.gbproid == '') {
  //     app.promsg("商品不存在");
  //     return;
  //   }
  //   if (groupBuyList.gbid == null || groupBuyList.gbid == '') {
  //     app.promsg("团购已不存在");
  //     return;
  //   }
  //   util.http({
  //     url: app.globalData.siteUrl + '/Main/Shopping/CheckGroupBuyStatus?devicetype=5',
  //     data: {
  //       uid: wx.getStorageSync('SessionUserID'),
  //       gbid: groupBuyList.gbid
  //     },
  //     header: 1,
  //     successBack: (ret)=>{
  //       ret=ret.data
  //       if (ret.success && ret.status == 1){
	// 				if (!type) {
	// 					this.checkGB()
	// 				} else if (type == 2) {		// 2 表示直接开团
	// 					this.goOrderComfirm()
	// 				}
  //       }else{
  //         app.promsg(ret.err)
  //       }
  //     }
  //   })
  // },
	
	// // 拼团购买跳转订单
	// goOrderComfirm(type) {
	// 	var that = this
	// 	let ogid = ''
	// 	let way = 'groupbuynow'
	// 	// type = 1 与他人拼团
	// 	if (type && type == 1) {
	// 		ogid = this.data.ptDetailData.orderid
	// 	}
	// 	// 有规格并且没有type(不是与他人拼团)
	// 	// console.log(that.data.buyPrice)
	// 	// console.log(type)
	// 	// return 
	// 	let gbskuid = ''
	// 	if (that.data.spec) {
	// 		this.data.sku.map((item, index) => {
	// 			if (item.skuid == that.data.skuid) {
	// 				gbskuid = that.data.gbsku[index].gbroductskuid
	// 			}
	// 		})
	// 	}
	// 	if (that.data.spec && !type) {
	// 		// 有规格开团
	// 		wx.navigateTo({
	// 			url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + that.data.skutext + '&skuid=' + that.data.skuid + '&gbprice=' + that.data.buyPrice + '&pid=' + that.data.msg.productid + '&gbid=' + groupBuyList.gbid + '&ogid=' + ogid + '&gbskuid=' + gbskuid + '&headfree=' + that.data.msg.headfree
	// 		})
	// 	} else if (that.data.spec && type) {
	// 		// 有规格参团
	// 		let price = that.data.spec ? that.data.buyPrice : that.data.ptDetailData.gbprice
	// 		wx.navigateTo({
	// 			url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + that.data.groupBuyList.gbskutext + '&skuid=' + that.data.skuid + '&gbprice=' + price + '&pid=' + that.data.msg.productid + '&gbid=' + that.data.groupBuyList.gbid + '&ogid=' + ogid + '&gbskuid=' + gbskuid
	// 		})
	// 	} else {
	// 		// 无规格
	// 		wx.navigateTo({
	// 			url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + that.data.groupBuyList.gbskutext + '&skuid=' + that.data.groupBuyList.gbskuid + '&gbprice=' + that.data.groupBuyList.gbprice + '&pid=' + that.data.msg.productid + '&gbid=' + that.data.groupBuyList.gbid + '&ogid=' + ogid + '&gbskuid=' + gbskuid + '&headfree=' + that.data.msg.headfree
	// 		})
	// 	}

	// },

	/*=====================================新添加的购买方法============================================*/
	// 直接买
	newBuyNow() {
		this.setData({
			buyGroup: false,
			skuBoxBottom: true
		})
	},
	newBuyGroup() {
		this.setData({
			buyGroup: true
		})
		util.http({
			url: app.globalData.siteUrl + '/Main/Shopping/CheckGroupBuyStatus?devicetype=5',
			data: {
				uid: wx.getStorageSync('SessionUserID'),
				gbid: this.data.groupBuyList.gbid
			},
			header: 1,
			successBack: (ret) => {
				ret = ret.data
				if (ret.success && ret.status == 1) {
					this.checkGB()
				} else {
					app.promsg(ret.err)
				}
			}
		})
	},
	// 检查是否有拼团
	checkGB() {
		util.http({
			url: app.globalData.siteUrl + '/Marketing/Groupbuy/IsHasGroupbuy?devicetype=5',
			// method: 'post',
			data: {
				gbid: this.data.options.gbid
			},
			// header: 1,
			successBack: ret => {
				ret = ret.data
				if (ret.success && ret.status == 1) {
					if (ret.IsHas) {
						this.setData({
							showTips: true
						})
					} else {
						// this.goOrderComfirm()
						this.showSku()
					}
				}
			}
		})
	},

	goPT(e) {
		let type = e.currentTarget.dataset.type
		if (type == 1) {
			this.showSku()
		} else {
			wx.navigateTo({
				url: '/pages/gblist/gblist?gbid=' + this.data.options.gbid,
			})
		}
		this.setData({
			showTips: false
		})
	},
	// 组件切换规格事件
	skuChange(e) {
		let skuid = e.detail.skuid
		let {spec,sku,gbsku} = this.data.specData
		sku.map((item, index) => {
			if (item.skuid == skuid) {
				this.setData({
					proearn: this.data.msg.skuobj[index].savemoney,
					gbearn: gbsku[index].gbearn,
					price: gbsku[index].gbskuPrice,
					oldPrice: item.saleprice,
					skutext: sku[index].skutext
				})
			}
		})
	},
	/*==========================================end==================================================*/
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		this.setData({
			uid: wx.getStorageSync("SessionUserID"),
			fxshopid: wx.getStorageSync("fxshopid"),
		})
		util.http({
			url: app.globalData.siteUrl + '/Main/Member/GetMemberJson?devicetype=5',
			data: {
				uid: wx.getStorageSync("SessionUserID")
			},
			loading_icon: 1,
			header: 1,
			successBack: (ret) => {
				if (ret && ret.data.status == 1) {
					this.setData({
						userMsg: ret.data.Data
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
		const timer = this.data.timer
		timer.forEach(item => clearInterval(item))
		// const {groupTimer} = this.data.groupTimer
		clearInterval(this.data.groupTimer)
		this.setData({
			timer: [],
			groupTimer: null
		})
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  /**
   * 用户点击右上角分享  ==暂时关闭==
   */
  onShareAppMessage() {
    var that = this
    let uid = wx.getStorageSync('SessionUserID')
    if (that.data.options.ruid) {
      ruid = that.data.options.ruid
    }
    // 分享夺宝商品详情
    if (this.data.isduobao) {
      let img = that.data.msg.imglist.length ? that.data.msg.imglist[0].imgvalue : that.data.msg.proimg
      return {
        title: '邀您一起抽奖',
        imageUrl: img,
        path: `/pages/groupbuy/groupbuy?cloudid=${that.data.msg.cloudid}`,
        success: function (res) {
          // 转发成功
          app.showtips('转发成功')
        },
        fail: function (res) {
          // 转发失败
          app.promsg('转发失败')
        }
      }
    } 
    // 拼团商品详情
    else {
      console.log(that.data.groupBuyList.shareimg)
      return {
				title: that.data.groupBuyList.sharetitle,
        imageUrl: that.data.groupBuyList.proimg,
				path: '/pages/groupbuy/groupbuy?gbid=' + that.data.options.gbid + '&pid=' + that.data.options.pid + '&registerId=' + wx.getStorageSync('SessionUserID'),
        success: function (res) {
          // 转发成功
          app.showtips('转发成功')
        },
        fail: function (res) {
          // 转发失败
          app.promsg('转发失败')
        }
      }
    }
  },
  //显示服务保障
  showMark: function () {
    this.setData({
      markShow: !this.data.markShow,
      bindBottom: !this.data.bindBottom
    })
  },
  // 点击遮罩层 隐藏弹窗
  hideMark () {
		this.setData({
			ptDetailData: '',
			ptData: '',
      markShow: true,
      bindBottom: false,
      showPt: true,
      showNum: false,
      showshare: [false, true],
      showHelper: true,
      skuBoxBottom: false,
			showTips: false
    })
  },
	//弹出分享框
	goshare: function () {
		CheckLoginStatus.checksession(() => {
			this.setData({
				showshare: [true, true],
				showtan: false
			})
		})
	},
	//关闭分享框
	closeshare: function (index) {
		//1是生成海报时观点弹出框但保留遮罩层
		if (index == 1) {
			this.setData({
				showshare: [true, false]
			})
		} else {
			sharebox.closeshare(this)
		}
	},
	//分享到朋友圈生成图片
	sharequan() {
		sharebox.sharequan(this, 3, 'group')
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
  // 点击数量事件 暂时保留 
  // changeCounts(e) {
  //   var type = parseInt(e.currentTarget.dataset.counts)
  //   let maxCounts = this.data.maxCounts
  //   let minCounts = this.data.minbuycount
  //   let nowStock = this.data.nowStock
  //   let buyCounts = this.data.buyCounts
  //   if (type == -1) {
  //     if (buyCounts == 1) return
  //   }
  //   if (type == 1) {
  //     if ((maxCounts === 0 && buyCounts < nowStock) || (buyCounts < maxCounts && buyCounts < nowStock)) {

  //     } else {
  //       return
  //     }
  //   }
  //   this.setData({
  //     buyCounts: this.data.buyCounts + type
  //   })
  // },
  // 点击参团事件
  showPtpop(e) {
    let {groupBuyList, ptData} = this.data
    let index = e.currentTarget.dataset.idx
    ptData = groupBuyList.gblist[index]
    this.setData({
      ptData
    })
    // 获取参团信息
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetMyGroupbuyDetails',
      data: {
        ogid: this.data.ptData.opengroupid,
        uid: wx.getStorageSync('SessionUserID')
      },
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
          let data = ret.data.Data[0]
          data.orderid = this.data.groupBuyList.gblist[index].opengroupid
          data.resobj.forEach(item => {
            if (!item.userimg) {
              item.userimg = '../../image/man.jpg'
            }
          })
          this.setData({
            ptDetailData: data,
            markShow: false,
            showPt: false
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  // 图片err时 自动替换默认头像
  imageError(e) {
    var index = e.currentTarget.dataset.index
    let { groupBuyList } = this.data
    groupBuyList.gblist[index].imgphoto = '../../image/man.jpg'
    this.setData({
      groupBuyList
    })
  },
  // 图片err时 自动替换默认头像
  popImgErr(e) {
    var index = e.currentTarget.dataset.index
    let { ptDetailData } = this.data
    ptDetailData.resobj[index].userimg = '../../image/man.jpg'
    this.setData({
      ptDetailData
    })
  },

  // 规格弹窗遮罩点击
  showSku() {
    // 弹出时 根据选择改变价格
    let price = ''
    var that = this
    if (!this.data.spec) {
      if (that.data.buyGroup) {
        price = that.data.groupBuyList.gbprice
      } else {
        price = that.data.msg.saleprice
      }
    } else {
      this.data.sku.forEach((item, i) => {
        if (item.skuid == that.data.skuid) {
          if (that.data.buyGroup) {
            price = that.data.gbsku[i].gbskuPrice
          } else {
            price = item.saleprice
          }
        }
      })
    }
    
    console.log(price)
    this.setData({
      skuBoxBottom: !this.data.skuBoxBottom,
      // buyGroup: false,
      buyPrice: price
    })
  },
  changSku(e) {
    var that = this
    var oldspecval = this.data.specval.split(",")
    oldspecval[e.currentTarget.dataset.len] = e.currentTarget.dataset.valueid
    this.setData({
      specval: oldspecval.toString()
    })
    this.data.sku.forEach((item, idx) => {
      let bus = ''
      //拼团读另一个规格
      if (this.data.buyGroup) {
        bus = Number(this.data.gbsku[idx].gbskuPrice).toFixed(2)
      } else {
        bus = Number(this.data.sku[idx].saleprice).toFixed(2)
      }
      
      item.specval == this.data.specval && this.setData({
        skuid: this.data.sku[idx].skuid,
        specval: this.data.sku[idx].specval,
        skutext: this.data.sku[idx].skutext,
        buyPrice: bus,
        ssprice: this.data.buyGroup ? this.data.sku[idx].saleprice : this.data.sku[idx].marketprice,
        nowStock: this.data.sku[idx].stock,
				price: bus,
				oldPrice: this.data.buyGroup ? this.data.sku[idx].saleprice : this.data.sku[idx].marketprice,
				gbearn: that.data.gbsku[idx].gbearn,
				proearn: that.data.msg.skuobj[idx].savemoney,
      })
    })
  },
  // 规格直接买
  realBuy() {
    var that = this
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.buyNowFunc()
        wx.hideLoading()
      })
    } else {
      that.buyNowFunc()
    }
  },
  // 拼团买
  realgbuy() {
    var that = this
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        // 有ptDetailData 表示点开了参团窗口即为参团
        if (that.data.ptDetailData) {
          // 有参团传1
          that.buygroup(1)
        } else {
          that.buygroup()
        }
        wx.hideLoading()
      })
    } else {
      if (that.data.ptDetailData) {
        that.buygroup(1)
      } else {
        that.buygroup()
      }
    }
  },
  /**
   * 
   * 以下来自夺宝详情新增函数
   */
  // 获取夺宝商品信息
  getlndianaProMsg(options) {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/GetOneCloudShoppingSet',
      data: {
        cloudid: options.cloudid,
        userid: wx.getStorageSync("SessionUserID")
      },
      // header: 1,
      successBack: this.lndianaSuccessBack
    })
  },
  // 夺宝商品信息成功回调函数
  lndianaSuccessBack(ret) {
    console.log(ret)
    if (ret.data.success && ret.data.status == 1) {
      const data = ret.data.Data[0]
      let imgUrls = []
      if (data.imglist.length) {
        data.imglist.forEach(item => imgUrls.push(item.imgvalue))
      } else {
        imgUrls.push(data.proimg)
      }
      let details = data.details
      WxParse.wxParse('productDetail', 'html', details, this, 0);
      this.setData({
        msg: data,
        imgUrls,
        price: data.cloudPrice,
        oldPrice: data.proprice,
        // ssprice: data.marketingprice,
        // productDetail
      })
    } else {
      app.promsg(ret.data.err)
    }
  },
  // 进入默认执行校检是否已参加活动
  hasJoin() {
    if (wx.getStorageSync("SessionUserID") != null || wx.getStorageSync("SessionUserID") != '') {
      util.http({
        url: app.globalData.siteUrl + '/Marketing/Cloudbuy/IsPayCloud?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
        method: 'post',
        data: {
          uid: wx.getStorageSync("SessionUserID"),
          cloudid: this.data.options.cloudid,
          buycount: 0
        },
        successBack: (ret) => {
          if (ret.data.success && ret.data.status == 20) {
            this.setData({
              hasJoin: true
            })
          }
        }
      })
    }
  },
  // 判断是否登录了
  confirmLogin () {
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.getShareData()
        wx.hideLoading()
      })
    } else {
      this.getShareData()
    }
  },
  // 点击确认数量事件 获取分享夺宝数据
  getShareData() {
    // patern为false表示一次只能购买一件
    if (!this.data.msg.patern) {
      if (this.data.lndianaNum > 1) {
        return app.promsg('购买数量不能大于1')
      }
    }
    // 来自分享助力支付 跳过获取改数据直接支付
    if (this.data.gopay) {
      return this.toSharePage()
    }
    util.http({
      // 181011152608452179
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/IsPayCloud?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
      method: 'post',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        cloudid: this.data.options.cloudid,
        buycount: this.data.lndianaNum
      },
      successBack: (ret) => {
        if (ret.data.success && ret.data.status == 1) {
          let data = ret.data.Data
          console.log(ret)
          if (this.data.lndianaNum > data.max) {
            return app.promsg('购买数量不能大于' + data.max)
          }
          if (this.data.lndianaNum > data.remainingamout) {
            return app.promsg('购买数量不能大于' + data.remainingamout)
          }
          this.setData({
            shareNum: data.remaining
          })
          this.toSharePage()
        } else {
          this.hideMark()
          // app.promsg(ret.data.err)
          setTimeout(function () {
            wx.showToast({
              title: ret.data.err,
              icon: 'none',
              duration: 3000
            })
          }, 1000)
        }
      }
    })
  },
  // 跳转分享页
  toSharePage() {
    // 暂时改为先付款 后分享
    let isshare = this.data.msg.isshare ? 1 : 0
    console.log(isshare)
    wx.navigateTo({
      url: `/pages/ordercomfirm/ordercomfirm?cid=${this.data.options.cloudid}&buyCounts=${this.data.lndianaNum}&way=lndiana&isshare=${isshare}`,
    })

    // 下面是需要分享才付款 (暂时保留) 

    // 不需要分享或剩余分享次数为0 直接跳转支付
    // if (!this.data.msg.isshare || this.data.shareNum <= 0 || this.data.gopay) {
    //   wx.navigateTo({
    //     url: `/pages/ordercomfirm/ordercomfirm?cid=${this.data.options.cloudid}&buyCounts=${this.data.lndianaNum}&way=lndiana`,
    //   })
    //   return
    // }
    // // 需要分享
    // if (this.data.msg.isshare && this.data.shareNum > 0) {
    //   wx.navigateTo({
    //     url: '/pages/lndianaShare/lndianaShare?buycount=' + this.data.lndianaNum + '&cid=' + this.data.options.cloudid,
    //   })
    // }
  },
  // 立即夺宝点击事件
  showlndiana() {
    this.setData({
      markShow: false,
      showNum: true
    })
  },
  // 夺宝数量点击事件
  lndianaCount(e) {
    if (!this.data.msg.patern) return
    let { lndianaNum } = this.data
    if (e.currentTarget.dataset.type && e.currentTarget.dataset.type == 'add') {
      lndianaNum = parseInt(lndianaNum) + 1
      lndianaNum = lndianaNum > this.data.msg.remainingamout ? this.data.msg.remainingamout : lndianaNum > this.data.msg.max ? this.data.msg.max : lndianaNum
    } else {
      lndianaNum = parseInt(lndianaNum) - 1
      lndianaNum = lndianaNum < 1 ? 1 : lndianaNum
    }
    this.setData({
      lndianaNum
    })
  },
// ======================== 以下是优惠券的函数 =================================

  // 
  showcoupon() {
    // 父调用子组件方法
    // this.selectComponent('#coupon').close()
    CheckLoginStatus.checksession(() => {
      this.setData({
        showCoupon: !this.data.showCoupon
      })
      wx.hideLoading()
      if (!this.data.hasGet && !this.data.unGet) {
        this.getCouponMsg()
      }
    })

  },
  // 获取优惠券数据
  getCouponMsg() {
    if (!wx.getStorageSync("SessionUserID")) return
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        ispaltform: 3,
        gbid: this.data.groupBuyList.gbid,
        comid: this.data.msg.companyid,
        isgb:'true'
      },
      successBack: ret => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
          let arr = []
          let data = ret.data.Data
          if (data.length) {
            var hasGet = []
            var unGet = []
            data.forEach(item => {
              // isover 表示总数领取完了 或领取次数剩余0了 就加入已领取列表
              if (!item.isover && (item.eachamount - item.getnum) > 0) {
                unGet.push(item)
              } else {
                hasGet.push(item)
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
      }
    })
  },
  gogongshang() {
    wx.navigateTo({
      url: '../other/gongshang/gongshang?img=' + this.data.msg.blurl
    })
  },
})

