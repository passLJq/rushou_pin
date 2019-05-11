// pages/normalProblem/normalProblem.js
var app = getApp()
const util = require("../../utils/util.js")

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isFixTop: true,		// 是否固定导航栏
		currentIndex: 0,
		nav: ["常见问题", "订单类", "配送类", "退款类", "售后类"],
		bottomBarPosition: 0,
		topHeight: 0,
		msg: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getBottomBarPosition()
		this.bindData()
	},

	// 获取数据
	bindData(idx) {
		var index = idx ? idx + 1 : 1
		if (this.data.msg && this.data.msg[index]) return
		util.http({
			url: app.globalData.siteUrl + '/Main/main/CommonProblem',
			data: {
				type: index
			},
			successBack: ret => {
				ret = ret.data
				if (ret.status == 1 && ret.success) {
					var data = ret.Data[0].content
					let {msg} = this.data
					msg[index] = JSON.parse(data)
					this.setData({
						msg
					})
				} else {
					app.promsg(ret.err)
				}
			}
		})
	},
	// 
	getBottomBarPosition() {
		wx.createSelectorQuery().select('#nav_0').boundingClientRect((ret) => {
			let bottomBarPosition = Number(ret.width / 2)
			this.setData({
				bottomBarPosition
			})
		}).exec()
	},
	// 导航切换
	changeNav(e) {
		let currentIndex = e.currentTarget.dataset.index || 0
		wx.createSelectorQuery().select('#nav_0').boundingClientRect((ret) => {
			let bottomBarPosition = e.currentTarget.offsetLeft + Number(ret.width / 2)
			this.setData({
				currentIndex,
				bottomBarPosition
			})
		}).exec()
		this.bindData(currentIndex)
	},
	// 客服
	phoneCall(e) {
		let tel = e.currentTarget.dataset.replyPhone
		app.alerts("400-6906-206", {
			confirmColor: "#FE4833",
			confirmText: "呼叫",
			successBack: () => {
				wx.makePhoneCall({
					phoneNumber: tel
				})
			},
			title: "需要拨打这个号码吗？"
		})

	},
	// 跳转详情
	goDetail(e) {
		var index = e.currentTarget.dataset.index
		wx.navigateTo({
			url: '/pages/problemSolution/problemSolution?num1=' + this.data.currentIndex + '&num2=' + index,
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