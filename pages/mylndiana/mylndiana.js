// pages/mylndiana/mylndiana.js
const app = getApp()
const util = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,            // 夺宝列表页数
    pageSize: 4,        // 夺宝页数量
    msg: [],            // 列表数据
    showMark: true,     // 显示遮罩
    showNum: true,      // 显示号码弹窗
    code: '',           // 夺宝号码code
    winningcode: '',      // 中奖号码
    hasMore: true,      // 是否还有更多数据
    done: false         // 判断夺宝是否已结束
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },
  // 获取我的夺宝列表信息
  getData() {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/GetMyCloudShoppingSet?devicetype=5',
      method: 'get',
      data: {
        currentPage: this.data.page,
        pageSize: this.data.pageSize,
        uid: wx.getStorageSync('SessionUserID'),
        // type: 100 // 1: 未揭晓 2: 已揭晓 3: 已中奖 100: 未揭晓+已中奖+已失效
        type: 200  // 已付款 + 已中奖 + 已失效
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
          let { msg } = this.data
          ret.data.Data.forEach((item) => {
            msg.push(item)
          })
          this.setData({
            msg
          })
        // console.log(this.data.msg)
        } else if (ret.data.success && ret.data.status == 2) {
          this.setData({
            hasMore: false
          })
        }
        
      }
    })
  },
  // 查看获奖号码
  checkNumber(e) {
    let cid = e.currentTarget.dataset.cid
    let idx = e.currentTarget.dataset.idx
    let done = e.currentTarget.dataset.done
    let winningcode = this.data.msg[idx].winningcode || ''
    this.setData({
      done,
      winningcode
    })
    this.getNumber(cid, idx)
  },
  // 查询号码数据
  getNumber(cid,idx) {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Cloudbuy/GetCloudCode?devicetype=5',
      data: {
        cloudid: cid,
        currentPage: '1',
        pageSize: '999',
        uid: wx.getStorageSync('SessionUserID')
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
          this.setData({
            showMark: false,
            showNum: false,
            code: ret.data.Data
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  // 关闭查看号码
  closeNumber() {
    this.setData({
      showMark: true,
      showNum: true
    })
  },
  // 跳转揭晓结果
  toResult (e) {
    let invalid = e.currentTarget.dataset.invalid // 1 为失效 0 为已开奖
    let idx = e.currentTarget.dataset.idx
    let data = this.data.msg[idx] // 拿取数据
    wx.navigateTo({
      url: `/pages/lndiresult/lndiresult?invalid=${invalid}&cid=${data.cloudid}&pid=${data.productid}&user=${data.username}&wincode=${data.winningcode}&img=${data.headphoto}&endtime=${data.lotterytime || data.endtime}`,
    })
  },
  // 跳转抽奖详情
  toDetail (e) {
    if (!e.currentTarget.dataset.cid) return
    wx.navigateTo({
      url: `/pages/lndiresult/lndiresult?cloudid=${e.currentTarget.dataset.cid}&ruid=${wx.getStorageSync('SessionUserID')}`
    })
  },
  // 跳转抽奖页
  tolndiana () {
		wx.navigateTo({
      url: '/pages/lndiana/lndiana',
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
    this.setData({
      msg: []
    })
    this.onLoad()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log(this.data.hasMore)
    if (!this.data.hasMore) return
    let {page} = this.data
    page += 1
    this.setData({
      page
    })
    this.getData()
  },

})