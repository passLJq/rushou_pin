// pages/tz_haibao/tz_haibao.js
const app = getApp()
const utils = require('../../utils/util.js')
const sharebox = require('../../Component/sharebox/sharebox.js')
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		erweima: '',
		showshare: [false, true],
		showtan: false,
		currentPic: 0  // 用哪个图片
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			erweima: app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + wx.getStorageSync("SessionUserID") + '&page=pages/index/index&width=430&devicetype=5'
		})
	},
	show() {
		this.setData({
			showshare: [true, true]
		})
	},
	closeshare() {
		this.setData({
			showshare: [false, true]
		})
	},
	// 分享朋友圈海报图片
	sharequan() {
		var that = this
		sharebox.sharequan(that, 3, 'ping', this.data.currentPic)
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
	changeBanner(e) {
		var index = e.detail.current
		this.setData({
			currentPic: index
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
    let img = 'https://images.rushouvip.cn/IMG/rspfx.png?' + Math.random() / 9999
		return {
			title: '邀您一起拼团',
			imageUrl: img,
			path: `/pages/index/index?registerId=${wx.getStorageSync("SessionUserID")}`,
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
})