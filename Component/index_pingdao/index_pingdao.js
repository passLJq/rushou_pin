const app = getApp()
const util = require("../../utils/util.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
		// 显示第几个分类的索引
    classIndex: {
      type: String,
      value: {},
      observer: function (newVal, oldVal) {
        if (!newVal) return
        this.setData({
					classIndex: newVal
        })
				// console.log(newVal)
      }
    },
		// 获取传入的分类商品数据
		classid: {
			type: String,
			value: {},
			observer: function (newVal, oldVal) {
				if (newVal != '' && newVal != null) {
					this.setData({
						classID: newVal,
						currentPage: 1,
						msg: '',
						hasMore: true
					})
					this.getClassJson()
				}
			}
		},
		title: {
			type: String,
			value: {},
			observer: function (newVal, oldVal) {
				if (newVal != '' && newVal != null) {
					this.setData({
						classTitle: newVal
					})
				}
			}
		},
  },

  /**
   * 组件的初始数据
   */
  data: {
    msg: '',						// 分类商品数据
		classIndex: 0,			// 显示分类的索引
		currentPage: 1,
		pageSize: 5,
		classTitle: '',
		classID: '',
		hasMore: true
  },
	attached() {
		// 在组件实例进入页面节点树时执行
	},
	created() {
		// 在组件实例刚刚被创建时执行
	},
  /**
   * 组件的方法列表
   */
  methods: {
		pullDown() {
			this.setData({
				currentPage: 1,
				hasMore: true
			})
			this.getClassJson()
		},
		getClassJson(page) {
			util.http({
				url: app.globalData.siteUrl + '/Main/Main/GetAllGBListJson',
				data: {
					currpage: page || this.data.currentPage,
					pagesize: this.data.pageSize,
					gbclassid: this.data.classID,
					// gbclassid: '170904111649958037'
				},
				successBack: rett => {
					let ret = rett.data
					console.log(ret)
					if (ret.success && ret.status == 1) {
						if (ret.Data.length < this.data.pageSize) {
							this.setData({
								hasMore: false
							})
						}
						if (ret.Data.length > 0) {
							ret.Data.map(item => {
								item.count = item.count ? item.count : Math.floor(Math.random() * 50) + 50
							})
						}
						if (this.data.currentPage == 1) {
							this.setData({
								msg: ret.Data
							})
						} else {
							let msg = [...this.data.msg, ...ret.Data]
							this.setData({
								msg
							})
							// console.log(this.data.msg)
						}
					} else if (ret.status == 0) {
						var msg = ''
						if (this.data.currentPage != 1) {
							msg = this.data.msg
						}
						this.setData({
							msg,
							hasMore: false
						})
					} else {
						app.promsg(ret.err)
					}
				}
			})
		},
		// 父组件下拉触底调用的方法
		getMore() {
			// 加载更多
			if (this.data.hasMore) {
				this.setData({
					currentPage: this.data.currentPage + 1
				})
				this.getClassJson()
			}
		},
		// 跳转详情
		toGroupBuy(e) {
			if (!e.currentTarget.dataset.gbid) return
			wx.navigateTo({
				url: `/pages/groupbuy/groupbuy?gbid=${e.currentTarget.dataset.gbid}&pid=${e.currentTarget.dataset.pid}`
			})
		}
  }
})