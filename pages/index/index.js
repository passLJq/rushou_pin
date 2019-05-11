var app = getApp()
const util = require("../../utils/util.js")

Page({
  data: {
    navIndex: 0,
		bottomBarPosition: '',
		trans: 0,
		banner: [],
		bannerIndex: 0,
		searchHeight: 40,	// 搜索栏的高度
		fixNav: false,  	// 固定选项栏
		page: 1,
		pageSize: 5,
		hasMore: true,    // 是否还有更多数据
		navArr: [
			{
				"cla": {
					"classid": "",
					"name": "热卖",
				}
			}
		],
		hasMsg: false,			// 消息红点
		groupdata: '',
		navimg: '',
		navtitle: '',
		classAll: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		if (options.scene) {
			wx.setStorageSync('registerId', options.scene)
		} else if (options.registerId) {
			wx.setStorageSync('registerId', options.registerId)
		}
		wx.createSelectorQuery().select('#search').boundingClientRect((ret) => {
			this.setData({
				searchHeight: ret.height
			})
		}).exec()
		wx.createSelectorQuery().select('#nav_0').boundingClientRect((ret) => {
			let bottomBarPosition = ret.width / 2
			this.setData({
				bottomBarPosition
			})
		}).exec()
		this.bindData()
  },
	bindData() {
		util.http({
			url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetGroupbuyBoot',
			successBack: (ret) => {
				if (ret.data.success && ret.data.status == 1) {
					let data = ret.data.Data
					let { banner, indicatorDots } = this.data
					if (data.length) {
						banner = data
					} else {
						banner = [{
							soure: "https://images.rushouvip.cn/IMG/tuan_banner.png",
							gbid: '',
							pid: ''
						}]
					}
					// 轮播图只有一张就隐藏指示点
					if (banner.length <= 1) {
						indicatorDots = false
					}
					this.setData({
						banner,
						indicatorDots
					})
				} else {
					app.promsg(ret.data.err)
				}
			}
		})
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
					var groupdata = ''
					if (template.groupdata != '' && template.groupdata != null) {
						groupdata = JSON.parse(template.groupdata)
					}
					// console.log(template.classallprodata)
					var classAll = JSON.parse(template.classallprodata)
					// console.log(JSON.parse(template.classallprodata))
					this.setData({
						groupdata,
						navimg: template.navimgdata,
						navtitle: template.navtitle,
						classAll
					})
				} else {
					app.promsg(ret.err)
				}
			}
		})
		// 获取分类数据
		util.http({
			url: app.globalData.siteUrl + '/Main/Main/GetAllGBClassJson?devicetype=5',
			successBack: ret => {
				var ret = ret.data
				if (ret.success && ret.status == 1) {
					let data = ret.Data
					let { navArr } = this.data
					// data.map((item, index) => {
					// 	navArr.push(item)
					// })
					navArr = [navArr[0], ...data]
					this.setData({
						navArr
					})
				} else {
					app.promsg(ret.err)
				}
			}
		})
	},
	toGroupBuy(e) {
		if (!e.currentTarget.dataset.gbid) return
		wx.navigateTo({
			url: `/pages/groupbuy/groupbuy?gbid=${e.currentTarget.dataset.gbid}&pid=${e.currentTarget.dataset.pid}`
		})
		//console.log(e)
	},
	changeNav(e) {
		var navIndex = e.currentTarget.dataset.index
		wx.createSelectorQuery().select('#nav_' + e.currentTarget.dataset.index).boundingClientRect((ret) => {
			// let bottomBarPosition = e.currentTarget.offsetLeft
			let bottomBarPosition = e.currentTarget.offsetLeft + (ret.width / 2)
			this.setData({
				navIndex,
				bottomBarPosition
			})
			// console.log(e)
			// console.log(ret)
		}).exec()
		wx.pageScrollTo({
			scrollTop: 0
		})
		// this.selectComponent("#pingdao").getClassJson(1)
	},
	// 轮播图滚动
	changeBanner(e) {
		var idx = e.detail.current
		this.setData({
			bannerIndex: idx
		})
	},
  // 分类跳转
	golink(e) {
		let index = e.currentTarget.dataset.idx
		let types = this.data.classAll[index]
		if (types && types[0] && types[0].type == 9) {
			util.and.clickAds(types[0].type, types[0].title, types[0].ref)
		} else {
			wx.navigateTo({
				url: '/pages/nas_prolist/nas_prolist?index=' + index + '&title=' + this.data.navtitle[index],
			})
		}
	},
  onPageScroll: function (e) {
		var t = e.scrollTop
		if (t >= this.data.searchHeight) {
			if (this.data.fixNav) return
			this.setData({
				fixNav: true
			})
		} else {
			if (!this.data.fixNav) return
			this.setData({
				fixNav: false
			})
		}
  },
	// 打开搜索页
	openSearch() {
		wx.navigateTo({
			url: '../search/search',
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
    //this.reset()
		// 消息红点
		if (wx.getStorageSync('SessionUserID')) {
			util.http({
				url: app.globalData.siteUrl + '/Main/Member/GetMessageCount?devicetype=5',
				data: {
					uid: wx.getStorageSync("SessionUserID")
				},
				header: 1,
				successBack: ret => {
					if (ret.data.success && ret.data.status == 1) {
						if (ret.data.Data > 0) {
							this.setData({
								hasMsg: true
							})
						} else {
							this.setData({
								hasMsg: false
							})
						}
					}
				}
			})
		}

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
		// 	navIndex: 0
		// })
		if (this.data.navIndex == 0) {
			this.bindData()
		} else {
			this.selectComponent("#pingdao").pullDown()
		}
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.navIndex != 0) {
			this.selectComponent("#pingdao").getMore();
		}
  },
  onShareAppMessage() {
		return {
			title: '入手拼',
			imageUrl: 'https://images.rushouvip.cn/IMG/rspfx.png',
			path: '/pages/index/index?registerId=' + wx.getStorageSync("SessionUserID"),
			success: function (res) {
				// 转发成功
				app.showtips('转发成功')
			},
			fail: function (res) {
				// 转发失败
				app.promsg('转发失败')
			}
		}
  },
  // 重置data数据
  reset() {
    
  },

	gogongshang() {
		wx.navigateTo({
			url: '../other/gongshang/gongshang?company=rushou'
		})
	},

	goMessageList() {
		wx.navigateTo({
			url: '../messagelist/messagelist',
		})
	}
})