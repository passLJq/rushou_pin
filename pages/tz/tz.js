// pages/tz/tz.js
var app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userMsg: '',				//个人信息
		uid: '',
		fxshopid: '',
		teamMsg: '',
		usn: '',						// username
		settingcount: 0,		// 后台设置的开店人数
		teamNum: 0					// 
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		
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
		this.setData({
			uid: wx.getStorageSync("SessionUserID"),
			fxshopid: wx.getStorageSync("fxshopid"),
		})
		if (wx.getStorageSync("SessionUserID")) {
			//获取个人信息
			util.http({
				url: app.globalData.siteUrl + '/Main/Member/GetMemberJson?devicetype=5',
				data: {
					uid: wx.getStorageSync("SessionUserID")
				},
				loading_icon: 1,
				header: 1,
				successBack: (ret) => {
					if (ret && ret.data.status == 1) {
						//在其他客户端开店后这里可以刷新开店
						if (wx.getStorageSync('fxshopid') == '') {
							if (ret.data.Data.fxshopid != '') {
								wx.setStorageSync('fxshopid', ret.data.Data.fxshopid)
							}
						}
						this.setData({
							userMsg: ret.data.Data,
							usn: ret.data.Data.name
						})
					} else {
						app.promsg(ret.err)
					}
				}
			})
			util.http({
				url: app.globalData.siteUrl + '/Main/Member/GetUserRegTeam?devicetype=5',
				data: {
					// uid: '181128173509710852',
					uid: wx.getStorageSync("SessionUserID"),
				},
				header: 1,
				successBack: ret => {
					console.log(ret)
					let data = ret.data
					if (data.success) {
						if (data.RecommendUserName) {
							if (/^1(3|4|5|7|8)\d{9}$/.test(data.RecommendUserName)) {
								var p = data.RecommendUserName
								var p1 = p.substr(0, 3)
								var p2 = p.substr(7,4)
								data.RecommendUserName = p1 + '****' + p2
							}
						}
						this.setData({
							teamMsg: {
								count: data.count,
								ztcount: data.ztcount,
								RecommendUserName: data.RecommendUserName
							},
							settingcount: data.settingcount
						})
					}
				}
			})

			util.http({
				url: app.globalData.siteUrl + '/Main/Member/GetMyTeam?devicetype=5',
				data: {
					uid: wx.getStorageSync("SessionUserID"),
					pageSize: 1,
					type: 1,
					currentPage: 1,
					search: ''
				},
				header: 1,
				successBack: rett => {
					let ret = rett.data
					if (ret.success && ret.status == 1) {
						this.setData({
							teamNum: ret.total
						})
					} else {
						// app.promsg(ret.err)
					}
				}
			})
		} else {
			this.setData({
				usn: '请登录'
			})
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	gomyteam() {
		if (wx.getStorageSync("fxshopid")) {
			wx.navigateTo({
				url: '../myallies/myallies',
			})
		} else {
			wx.navigateTo({
				url: '../myfans/myfans',
			})
		}
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
		this.onShow()
		// console.log(111)
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