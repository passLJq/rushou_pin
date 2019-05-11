// pages/myallies/myallies.js
var app = getApp()
const util = require("../../utils/util.js")

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		currentTab: 0,
		swiperHeight: 0,
		currentPage: 1,
		pageSize: 999,
		msg: '',				// 团队数据
		first: '',			// 一级
		second: '',			// 二级
		searchWord: '',
		fxshopid: '',
		hasMore: [true, true]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// return
		
		this.setData({
			fxshopid: wx.getStorageSync("fxshopid")
		})
		var wh = wx.getSystemInfoSync().windowHeight
		wx.createSelectorQuery().select('#swiper').boundingClientRect((ret) => {
			this.setData({
				swiperHeight: wh - ret.top
			})
		}).exec()
		this.bindData(1)
		this.bindData(2)
	},

	changeTab(e) {
		console.log(e)
		if (e.type == "change") {
			this.setData({
				currentTab: e.detail.current
			})
		} else {
			this.setData({
				currentTab: e.currentTarget.dataset.tab
			})
		}
		
	},
	toTeamDetail(e) {
		var data = ''
		if (e.currentTarget.dataset.type == 1) {
			data = JSON.stringify(this.data.first[e.currentTarget.dataset.idx])
		} else {
			data = JSON.stringify(this.data.second[e.currentTarget.dataset.idx])
		}
		wx.navigateTo({
			url: '/pages/team_detail/team_detail?teamMsg=' + data
		})
	},
	// 团队等级，页数，查询内容
	bindData(type, search) {
		util.http({
			url: app.globalData.siteUrl + '/Main/Member/GetMyTeam?devicetype=5',
			data: {
				uid: wx.getStorageSync("SessionUserID"),
				pageSize: this.data.pageSize,
				type: type || 1,
				currentPage: this.data.currentPage,
				search: search || ''
			},
			header: 1,
			successBack: ret => {
				if (ret.data.success) {
					if (ret.data.status == 1) {
						if (type && type == 1) {
							// 首次加载
							if (this.data.currentPage == 1 || search) {
								this.setData({
									first: ret.data.Data
								})
							} else {
								let first = [...this.data.first, ...ret.data.Data]
								this.setData({
									first
								})
							}
							
						} else {
							// 首次加载
							if (this.data.currentPage == 1 || search) {
								this.setData({
									second: ret.data.Data
								})
							} else {
								let second = [...this.data.second, ...ret.data.Data]
								this.setData({
									second
								})
							}
						}

						if (ret.data.Data < this.data.pageSize) {
							let hasMore = this.data.hasMore
							if (type && type == 1) {
								hasMore[0] = false
							} else {
								hasMore[1] = false
							}
							this.setData({
								hasMore
							})
						}
					} else {
						let hasMore = this.data.hasMore
						if (type && type == 1) {
							hasMore[0] = false
							this.setData({
								hasMore,
								first: ''
							})
						} else {
							hasMore[1] = false
							this.setData({
								hasMore,
								second: ''
							})
						}
					}
					let msg = {
						first: ret.data.first,
						second: ret.data.second,
						total: ret.data.total,
						totalpoint: ret.data.totalpoint,
					}
					this.setData({
						msg
					})
				}
			}
		})
	},
	// 绑定输入的值
	getSearch(e) {
		var str = String(e.detail.value).replace(/\s+/g, '')
		this.setData({
			searchWord: str
		})
	},
	// 搜索
	goSearch() {
		var reg = new RegExp(/^\d+$/)
		if (!this.data.searchWord) {
			this.bindData(1)
			this.bindData(2)
		} else if (reg.test(this.data.searchWord)) {
			this.setData({
				currentPage: 1
			})
			this.bindData(1, this.data.searchWord)
			this.bindData(2, this.data.searchWord)
		} else {
			app.promsg('只能搜索邀请码和手机号！')
		}
		
	},
	toMyFans() {
		wx.navigateTo({
			url: '../myfans/myfans',
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
		this.onload()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		let currentPage = this.data.currentPage + 1
		this.setData({
			currentPage
		})
		if (hasMore[0]) {
			this.bindData(1)
		}
		if (hasMore[1]) {
			this.bindData(2)
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		
	}
})