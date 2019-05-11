// pages/myfans/myfans.js
var app = getApp()
const util = require("../../utils/util.js")

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		teamMsg: '',      // 我的邀请数据
		count: '',
		fxshopid: '',
		settingcount: 0		// 邀请多少人开店人数
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (wx.getStorageSync('fxshopid')) {
			this.getFans()
		} else {
			this.getInv()
		}
		this.setData({
			fxshopid: wx.getStorageSync('fxshopid')
		})
	},
	// 获取数据
	getInv() {
		util.http({
			url: app.globalData.siteUrl + '/Main/Member/GetUserRegTeam?devicetype=5',
			data: {
				uid: wx.getStorageSync("SessionUserID"),
				// currentPage: this.data.currentPage,
				// pageSize: '10',
				// search: ''
			},
			header: 1,
			successBack: ret => {
				let data = ret.data
				if (data.success) {
					if (!data.Data) return
					let teamMsg = data.Data
					this.setData({
						teamMsg,
						count: data.count,
						settingcount: data.settingcount
					})
				} else {
					// app.promsg(data.err)
				}
			}
		})
	},
	// 
	getFans() {
		util.http({
			url: app.globalData.siteUrl + '/Main/Member/GetMyFans?deviceType=5',
			data: {
				uid: wx.getStorageSync('SessionUserID'),
				currentPage: 1,
				pageSize: 999,
				search: ''
			},
			header: 1,
			successBack: rett => {
				let ret = rett.data
				if (ret.success && ret.status == 1) {
					if (ret.Data.length > 0) {
						ret.Data.map(item => {
							item.createtime = item.createtime.split(' ')[0]
						})
					}
					this.setData({
						teamMsg: ret.Data
					})
				} else {
					// app.promsg(ret.err)
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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})