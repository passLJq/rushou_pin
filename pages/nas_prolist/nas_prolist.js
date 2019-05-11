// pages/nas_prolist/nas_prolist.js
const app = getApp()
const util = require('../../utils/util.js')
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		msg: '',
		// currentPage: 1,
		// pageSize: 10,
		index: '',
		// hasMore: true
		showNoData: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let title = '商品列表'	// 防止没标题
		if (options.title) {
			title = unescape(options.title)
			
		}
		wx.setNavigationBarTitle({
			title
		})
		this.setData({
			index: options.index
		})
		this.getGrouplist(options.index)
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
	getGrouplist() {
		var that = this
		// util.http({
		// 	url: app.globalData.siteUrl + '/Main/Main/GetAllGBListJson',
		// 	data: {
		// 		code: 'ping',
		// 		// currpage: that.data.currentPage,
		// 		// pagesize: that.data.pageSize
		// 	},
		// 	successBack: rett => {
		// 		let ret = rett.data
		// 		if (ret.success && ret.status == 1) {
		// 			this.setData({
		// 				msg: ret.temgbobj[this.data.index]
		// 			})
		// 		} else {
		// 			app.promsg(ret.err || err.Msg)
		// 		}
		// 	}
		// })
		util.http({
			url: app.globalData.siteUrl + '/Main/Main/GetAppTempShopIndexJson',
			data: {
				userid: wx.getStorageSync('SessionUserID'),
				fxshopid: wx.getStorageSync('fxshopid'),
				code: 'ping'
			},
			successBack: rett => {
				var ret = rett.data
				if (ret.success && ret.status == 1) {
					var template = ret.Data.template
					var data = JSON.parse(template.classallprodata)
					var msg = data[this.data.index]
					if (msg.length > 0) {
						msg.map(item => {
							item.userimglist = JSON.parse(item.userimglist)
							item.count = item.count ? item.count : Math.floor(Math.random() * 50) + 50
						})
						this.setData({
							msg
						})
					} else {
						this.setData({
							showNoData: true
						})
					}
				} else {
					app.promsg(ret.err)
				}
				
			}
		})
	},
	toGroupBuy(e) {
		if (!e.currentTarget.dataset.gbid) return
		wx.navigateTo({
			url: `/pages/groupbuy/groupbuy?gbid=${e.currentTarget.dataset.gbid}`
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
		// this.setData({
		// 	currentPage: 1
		// })
		this.getGrouplist()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		// if (hasMore) {
		// 	let {currentPage} = this.data
		// 	currentPage += 1
		// 	this.setData({
		// 		currentPage
		// 	})
		// }
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})