// pages/problemSolution/problemSolution.js
var app = getApp()
const util = require("../../utils/util.js")
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		msg: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		util.http({
			url: app.globalData.siteUrl + '/Main/main/CommonProblem',
			data: {
				type: options.num1 - 0 + 1  // 减零只是为了转为number
			},
			successBack: ret => {
				ret = ret.data
				if (ret.status == 1 && ret.success) {
					var data = JSON.parse(ret.Data[0].content)[options.num2]
					console.log(data)
					this.setData({
						msg: data
					})
				} else {
					app.promsg(ret.err)
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