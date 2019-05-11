var app = getApp()
const util = require("../../utils/util.js")

Page({
  data: {
    // 轮播数据
    banner: [],           // 夺宝轮播数据
    indicatorDots: true,  // 是否显示指示点
    autoplay: true,
    interval: 3000,
    duration: 500,
    markShow: true,       // 弹窗遮罩
    isShowRule: true,     // 活动规则弹窗
    // 轮播数据 end

    proData: [],          // 分享商品数据
    hasMore: true,        // 触底是否继续加载商品列表
    page: 1,              // 分享商品数据页数
    pageSize: 5,          // 分享商品每页数量
    sqltype: 1,           // 当前nav选项卡id 1:本期活动 2:下期活动 3:已结束
    nav: [                // nav导航选项数据
      {
        name: "本期活动",
        sqltype: "1"
      },
      {
        name: "下期活动",
        sqltype: "2"
      },
      {
        name: "已结束",
        sqltype: "3"
      }
    ],
    bottomBarPosition: 125, // 导航选项底部条的left位置
    currentIndex: 0,       // 导航栏当前选项
    isFixTop: false,      // 选项卡是否悬在顶部
    topHeight: 0,         // 顶部高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reset()
    this.getProData() // 获取拼团商品列表数据
    this.getBanner() // 获取轮播图数据
    this.getBottomBarPosition()
    this.getHeaderHeight()  // 获取顶部高度
  },
  // 获取顶部高度
  getHeaderHeight() {
    let topHeight = 0
    try {
      wx.createSelectorQuery().select('#swiper').boundingClientRect((rect) => {
        topHeight += rect.height
        wx.createSelectorQuery().select('#shuoming').boundingClientRect((rect) => {
          topHeight += rect.height
          this.setData({
            topHeight
          })
          console.log(topHeight)
        }).exec()
      }).exec()
    } catch (err) { }
  },
  onPageScroll: function (e) {
    if (e.scrollTop >= this.data.topHeight) {
      this.setData({
        isFixTop: true
      })
    } else {
      if (this.data.isFixTop) {
        this.setData({
          isFixTop: false
        })
      }
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // this.reset()
    this.onLoad()
  },
  onShareAppMessage() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { page, sqltype, hasMore } = this.data
    if (!hasMore) return
    page += 1
    this.setData({
      page,
      sqltype
    })
    this.getProData()
  },
  // 重置data数据
  reset() {
    this.setData({
      page: 1,
      sqltype: '1',
      hasMore: true,
      proData: [],
      currentIndex: 0,
      banner: []
    })
  },
  // 获取商品列表
  getProData() {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/GetCloudShoppingSet',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        currentPage: this.data.page,
        pageSize: this.data.pageSize,
        sqltype: this.data.sqltype,
        type: "2"
      },
      successBack: this.proDataSuccess
    })
  },

  // 获取商品列表成功回调
  proDataSuccess(ret) {
    if (ret.data.success && ret.data.status == 1) {
      let { proData } = this.data
      //获取商品列表长度小于pageSize 则关闭触底加载
      if (ret.data.Data.length < this.data.pageSize) {
        this.setData({
          hasMore: false
        })
      }
      let data = ret.data.Data
      data.forEach(item => {
          proData.push(item)
      })
      this.setData({
        proData
      })
    } else {
      // app.promsg(ret.data.err)
    }
    //isparticipate为 2 表示已参加了夺宝
    console.log(ret)
  },

  // 点击选项页
  changeNav: function (e) {
    // nav选项卡页面效果
    let currentIndex = e.currentTarget.dataset.index || 0
    wx.createSelectorQuery().select('#nav_0').boundingClientRect((ret) => {
      let bottomBarPosition = e.currentTarget.offsetLeft + Number(ret.width / 2)
      this.setData({
        currentIndex,
        bottomBarPosition
      })
    }).exec()
    // 点击更新拼团数据
    let { sqltype, page } = this.data
    sqltype = e.currentTarget.dataset.sqltype
    page = 1
    this.setData({
      page,
      sqltype,
      proData: [],
      hasMore: true
    })
    this.getProData()
  },

  // 根据导航第一个选项 定义底部条(BottomBarPosition)的位置
  getBottomBarPosition() {
    wx.createSelectorQuery().select('#nav_0').boundingClientRect((ret) => {
      let bottomBarPosition = Number(ret.width / 2)
      this.setData({
        bottomBarPosition
      })
    }).exec()
  },
  // 跳转夺宝详情页
  toLndianaDetail(e) {
    if (!e.currentTarget.dataset.cid) return
    wx.navigateTo({
      url: `/pages/groupbuy/groupbuy?cloudid=${e.currentTarget.dataset.cid}`
    })
  },
  // 隐藏或显示活动规则弹窗
  showRule() {
    this.setData({
      markShow: !this.data.markShow,
      isShowRule: !this.data.isShowRule
    })
  },
  // 获取轮播图数据
  getBanner() {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/GetCloudShoppingSet',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        currentPage: 1,
        pageSize: 1,
        sqltype: 1,
        type: "2"
      },
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success) {
          let data = ret.data.cloudurlimg
          let { banner, indicatorDots } = this.data
          if (data && data.length) {
            banner = data
          } else {
            banner = [{
              soure: "../../image/banner2.jpg",
              cid: '',
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
        }
      }
    })
  },
  // 点击轮播图跳转
  toGroupBuy (e) {
    if (e.currentTarget.dataset.cid && e.currentTarget.dataset.pid) {
      wx.navigateTo({
        url: '/pages/groupbuy/groupbuy?cloudid=' + e.currentTarget.dataset.cid + '&pid=' + e.currentTarget.dataset.pid,
      })
    }
  },
  golink(e) {
    var pid = e.currentTarget.dataset.pid
    var cid = e.currentTarget.dataset.cid
    util.and.clickAds('1005', pid, gbid)
  }
})