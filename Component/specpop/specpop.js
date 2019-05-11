const app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
const WxParse = require('../../wxParse/wxParse.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    msg: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {
        if (!newVal) return
        this.setData({
					msg: newVal,
					nowStock: newVal.stock,
					minCounts: newVal.minbuycount,
					maxCounts: newVal.maxbuycount,
					price: newVal.saleprice,
					ssprice: newVal.marketingprice,
					proearn: newVal.commPrice
        })
      }
    },
		groupBuyList: {
			type: Object,
			value: {},
			observer: function (newVal, oldVal) {
				if (!newVal) return
				this.setData({
					groupBuyList: newVal,
					// price: newVal.gbprice,
					buyPrice: newVal.gbprice,
					gbnum: newVal.gbnum,
					gbearn: newVal.gbearn,
				})
				// console.log(this.data.price)
			}
		},
		specData: {
			type: Object,
			value: {},
			observer: function (newVal, oldVal) {
				if (!newVal) return
				let bus = ''
				bus = newVal.gbsku[0].gbskuPrice.toFixed(2)
				var idx = 0		// 获取拼团价最低的规格索引 默认为0
				if (newVal.sku.length > 1) {
					var dsku = newVal.gbsku
					var p = dsku[0].gbskuPrice		// 获取最低的拼团规格价 默认为第一个拼团规格价
					dsku.map((item, index) => {
						if (item.gbskuPrice < p) {
							p = item.gbskuPrice
							idx = index
						}
					})
				}
				this.setData({
					spec: newVal.spec,
					gbsku: newVal.gbsku,
					sku: newVal.sku,
					skutext: newVal.sku[idx].skutext,
					specval: newVal.sku[idx].specval,
					skuid: newVal.sku[idx].skuid,
					buyPrice: bus,
					nowStock: newVal.sku[idx].stock,
					price: newVal.sku[0].saleprice,
					// oldPrice: newVal.sku[0].saleprice,
					ssprice: newVal.sku[idx].marketprice,
					gbearn: newVal.gbsku[idx].gbearn,
					proearn: this.data.msg ? this.data.msg.skuobj[idx].savemoney : 0
				})
				console.log(this.data.buyPrice)
				console.log(this.data.price)
				console.log(this.data.oldPrice)
			}
		},
		skuBoxBottom: {
			type: Boolean,
			value: {},
			observer: function (newVal, oldVal) {
				if (newVal == '' || newVal == null) return
				this.setData({
					skuBoxBottom: newVal
				})
				console.log(this.data.buyPrice)
			}
		},
		ptDetailData: {
			type: Object,
			value: {},
			observer: function (newVal, oldVal) {
				if (!newVal) return
				this.setData({
					ptDetailData: newVal
				})
				
			}
		},
		isBuyGroup: {
			type: Boolean,
			value: {},
			observer: function (newVal, oldVal) {
				console.log(newVal)
				
				this.setData({
					isBuyGroup: newVal
				})

				if (this.data.msg && this.data.msg.openspec && this.data.skuid) {
					this.data.sku.map((item, index) => {
						if (item.skuid == this.data.skuid) {
							// var p = 0
							// p = this.data.isBuyGroup ? this.data.gbsku[index].gbskuPrice : item.saleprice
							this.setData({
								buyPrice: this.data.gbsku[index].gbskuPrice,
								gbearn: this.data.gbsku[index].gbearn,
								price: item.saleprice,
								proearn: this.data.msg.skuobj[index].savemoney
							})
						}
					})
				}
				console.log(this.data.isBuyGroup)
			}
		},
  },

  /**
   * 组件的初始数据
   */
  data: {
    msg: '',
		spec: '',
		buyCounts: 1,            // 购买数量
		buyPrice: 0.00,          // 单价
		ssprice: 0.00,           // 规格对应的售价
		minCounts: 0,            // 最小购买数量 0=无限制
		maxCounts: 0,            // 最大购买数量0=无限制
		nowStock: 0,             // 当前规格库存
		gbsku: [],               // 拼团规格数据
		sku: [],                 // 普通规格数据
		skuid: "",               // 规格id
		specval: "",
		skutext: "",
		proearn: 0,
		gbearn: 0,
		price: 0,
		// ssprice: 0,
		oldPrice: 0,
		gbnum: 0,
		skuBoxBottom: false,
		ptDetailData: '',
		isBuyGroup: true,
		isIphoneX: false,
  },
  ready() {
    console.log('ready')
		if (app.globalData.isIphoneX) {
			this.setData({
				isIphoneX: true
			})
		}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 关闭
    close() {
      this.triggerEvent('close')
    },
		changSku(e) {
			var that = this
			var oldspecval = this.data.specval.split(",")
			oldspecval[e.currentTarget.dataset.len] = e.currentTarget.dataset.valueid
			this.setData({
				specval: oldspecval.toString()
			})
			console.log(this.data.gbsku)
			this.data.sku.forEach((item, idx) => {
				let bus = ''
				if (this.data.isBuyGroup) {
					bus = Number(this.data.gbsku[idx].gbskuPrice).toFixed(2)
				} else {
					bus = Number(this.data.sku[idx].saleprice).toFixed(2)
				}
				console.log(this.data.isBuyGroup)
				console.log(bus)
				if (item.specval == this.data.specval) {
					this.setData({
						skuid: this.data.sku[idx].skuid,
						specval: this.data.sku[idx].specval,
						skutext: this.data.sku[idx].skutext,
						buyPrice: bus,
						ssprice: this.data.sku[idx].marketprice,
						nowStock: this.data.sku[idx].stock,
						price: bus,
						oldPrice: this.data.sku[idx].saleprice,
						gbearn: that.data.gbsku[idx].gbearn,
						proearn: that.data.msg ? that.data.msg.skuobj[idx].savemoney : 0,
					})
					this.triggerEvent('skuChange', { skuid: this.data.sku[idx].skuid})
				}
			})
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

		//拼团购买校检
		buygroup(type) {
			var that = this
			var groupBuyList = that.data.groupBuyList
			if (groupBuyList.gbproid == null || groupBuyList.gbproid == '') {
				if (groupBuyList.proid == null || groupBuyList.proid == '') {
					app.promsg("商品不存在");
					return;
				}
			}
			if (groupBuyList.gbid == null || groupBuyList.gbid == '') {
				app.promsg("团购已不存在");
				return;
			}
			util.http({
				url: app.globalData.siteUrl + '/Main/Shopping/CheckGroupBuyStatus?devicetype=5',
				data: {
					uid: wx.getStorageSync('SessionUserID'),
					gbid: groupBuyList.gbid
				},
				header: 1,
				successBack: (ret) => {
					ret = ret.data
					if (ret.success && ret.status == 1) {
						let ogid = ''
						let way = 'groupbuynow'
						// type = 1 与他人拼团
						if (type && type == 1) {
							ogid = this.data.ptDetailData.orderid
						}
						// 有规格并且没有type(不是与他人拼团)
						// console.log(that.data.buyPrice)
						// console.log(type)
						// return 
						let gbskuid = ''
						let pid = that.data.groupBuyList.gbproid || that.data.groupBuyList.proid
						let headfree = ogid ? '' : that.data.msg.headfree
						let openspec = that.data.spec ? true : false
						if (openspec) {
							this.data.sku.map((item, index) => {
								if (item.skuid == that.data.skuid) {
									gbskuid = that.data.gbsku[index].gbroductskuid
								}
							})
						}

						if (openspec && !type) {
							// 有规格开团
							wx.navigateTo({
								url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + that.data.skutext + '&skuid=' + that.data.skuid + '&gbprice=' + that.data.buyPrice + '&pid=' + pid + '&gbid=' + groupBuyList.gbid + '&ogid=' + ogid + '&gbskuid=' + gbskuid + '&headfree=' + that.data.msg.headfree
							})
						} else if (openspec && type) {
							// 有规格参团
							let price = openspec ? that.data.buyPrice : that.data.ptDetailData.gbprice
							wx.navigateTo({
								url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + that.data.skutext + '&skuid=' + that.data.skuid + '&gbprice=' + price + '&pid=' + pid + '&gbid=' + that.data.groupBuyList.gbid + '&ogid=' + ogid + '&gbskuid=' + gbskuid
							})
						} else {
							// 无规格
							let skutext = that.data.groupBuyList.gbskutext || ''
							wx.navigateTo({
								url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + skutext + '&skuid=' + that.data.groupBuyList.gbskuid + '&gbprice=' + that.data.groupBuyList.gbprice + '&pid=' + pid + '&gbid=' + that.data.groupBuyList.gbid + '&ogid=' + ogid + '&gbskuid=' + gbskuid + '&headfree=' + headfree
							})
						}

					} else {
						app.promsg(ret.err)
					}
				}
			})
		},

		// 直接买
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
		//立即购买校检
		buyNowFunc() {
			// console.log(this.data.skuid)
			// console.log(this.data.buyCounts)
			// return
			var that = this
			//普通商品校检
			let data = {
				uid: wx.getStorageSync('SessionUserID'),
				pid: that.data.msg.productid,
				buycount: 1,
				skuid: that.data.msg.openspec ? that.data.skuid : that.data.groupBuyList.gbskuid
			}
			util.http({
				url: app.globalData.siteUrl + '/Main/Shopping/CheckProductBuyStatus?devicetype=5',
				data: data,
				header: 1,
				successBack: ret => {
					if (ret) {
						if (ret.data.status == 1) {
							var that = this
							let way = 'buynow'
							if (this.data.msg.openspec) {
								wx.navigateTo({
									url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + this.data.skutext + '&skuid=' + this.data.skuid + '&skuprice=' + this.data.price + '&pid=' + this.data.msg.productid + '&companyid=' + this.data.msg.companyid
								})
							} else {
								wx.navigateTo({
									url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + this.data.groupBuyList.gbskutext + '&skuid=' + this.data.groupBuyList.gbskuid + '&skuprice=' + this.data.buyPrice + '&pid=' + this.data.msg.productid + '&companyid=' + this.data.msg.companyid
								})
							}
						} else {
							app.alerts(ret.data.err, { showCancel: true });
						}
					} else {
						app.promsg(err.msg);
					}
					wx.hideLoading()
				}
			})
		},
  }
})