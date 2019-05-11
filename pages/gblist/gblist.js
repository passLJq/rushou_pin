// pages/gblist/gblist.js
var app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		options: '',
		msg: {},                 // 商品数据
		groupBuyList: {},        // 商品拼团信息
		specData: '',            // 拼团商品规格数据
		skuBoxBottom: false,     // 显示规格弹窗
		// buyCounts: 1,            // 购买数量
		// buyPrice: 0.00,          // 单价
		// ssprice: 0.00,           // 规格对应的售价
		// minCounts: 0,            // 最小购买数量 0=无限制
		// maxCounts: 0,            // 最大购买数量0=无限制
		// nowStock: 0,             // 当前规格库存
		// gbsku: [],               // 拼团规格数据
		// sku: [],                 // 普通规格数据
		// skuid: "",               // 规格id
		// specval: "",
		// skutext: "",
		timer: [],               // 拼团倒计时的计时器
		countDownTime: [],       // 倒计时时间
		gbearn: 0,							 // 拼团赚
		proearn: 0,							 // 直接买赚
		skuBoxBottom: false,
		showPt:true,
		ptData: '',
		ptDetailData: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			options
		})
		this.bindData()
	},
	closePt() {
		this.setData({
			showPt: true
		})
	},
	bindData() {
		// 获取商品拼团信息
		util.http({
			url: app.globalData.siteUrl + '/Main/Main/GetGroupBuyProJson',
			data: {
				gbid: this.data.options.gbid,
				uid: wx.getStorageSync("SessionUserID"),
				ogid: '',
				fxshopid: wx.getStorageSync("fxshopid")
			},
			successBack: (ret) => {
				console.log(ret)
				if (ret.data.success && ret.data.status == 1) {
					this.setData({
						// price: ret.data.Data.gbprice,
						// gbnum: ret.data.Data.gbnum,
						// gbearn: ret.data.Data.gbearn,
						groupBuyList: ret.data.Data
					})
					this.getProductMsg(ret.data.Data.gbproid) // 获取商品信息
					// this.getCouponMsg()  // 读取优惠券数据
					// this.getCount()		// 计算活动时间
					var that = this
					// console.log(ret.data.Data.gblist)
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
	msgSuccessBack(ret) {
		if (ret.data.success && ret.data.status == 1) {
			const data = ret.data.Data
			// let desc = data.description
			// WxParse.wxParse('productDetail', 'html', desc, this, 0);
			// console.log(url)
			this.setData({
				msg: data,
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
				
				this.setData({
					specData: data
				})
			}
		})
	},
	// 计算剩余时间
	countLastTimes(time, index) {
		let { timer, countDownTime } = this.data
		let t = time
		let idx = index
		var that = this
		timer[index] = setInterval(() => {
			t -= 1
			if (t < 0) {
				let { groupBuyList } = this.data
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
			countDownTime[idx] += seconds
			that.setData({
				countDownTime
			})
		}, 1000)
	},
	// 规格弹窗遮罩点击
	showSku() {
		this.setData({
			skuBoxBottom: !this.data.skuBoxBottom,
		})
	},
	// 点击参团事件
	showPtpop(e) {
		let { groupBuyList, ptData } = this.data
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
						showPt: false
					})
				} else {
					app.promsg(ret.data.err)
				}
			}
		})
	},
	// 跳转拼团详情
	goGroupDetail(e) {
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
					// buyGroup: true,
					showPt: true
				})
				this.showSku()
				wx.hideLoading()
			})
		} else {
			// that.buygroup(1)
			this.setData({
				showPt: true,
				// buyGroup: true
			})
			this.showSku()
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
		this.onUnload()
		this.bindData()
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