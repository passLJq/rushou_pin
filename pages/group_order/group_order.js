// pages/group_order/group_order.js
var app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listdata:'',
    currentPage:1,
    stops:false,
    checktype:[true,false,false,false],
    orderstatr:100 //100是全部订单，1是进行中，2是已成功，3是失败
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		if (options.orderstatr) {
			let checktype = [false,false,false,false]
			if (options.orderstatr == 100) {
				checktype[0] = true
			} else {
				checktype[options.orderstatr] = true
			}
			this.setData({
				checktype,
				orderstatr: options.orderstatr
			})
		}
    this.databind()
  },
  databind:function(){
    var that=this
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetMyGroupbuy?devicetype=5',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        currentPage: this.data.currentPage,
        pageSize: 6,
        gbuystate: that.data.orderstatr
      },
      header: 1,
      successBack: (ret) => {
        ret = ret.data
        if (ret.status == 1 && ret.success) {
          if (that.data.currentPage==1){
            that.data.listdata=[]
          }
          this.setData({
            listdata: that.data.listdata.concat(ret.Data)
          })
        } else if (ret.status == 2 && ret.success){
          if (that.data.currentPage == 1) {
            this.setData({
              listdata: []
            })
          }
          this.data.stops=true
          if (that.data.listdata.length>0){
            app.promsg('没有更多数据了')
          }
        }else{
          app.promsg(ret.err)
        }
      }
    })
  },
  go_group_detail:function(e){
    var orderid = e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: '/pages/group_detail/group_detail?orderid=' + orderid
    })
  },
  change:function(e){
    var index = e.currentTarget.dataset.index
    let a=[]
    for(var i=0;i<4;i++){
      a.push(false)
    }
    a[index]=true
    this.setData({
      checktype:a
    })
    if(index=='0'){
      this.data.orderstatr=100
    } else if (index == '1'){
      this.data.orderstatr = 1
    } else if (index == '2') {
      this.data.orderstatr = 2
    } else if (index == '3') {
      this.data.orderstatr = 3
    }
    this.data.currentPage=1
    this.data.stops = false
    this.databind()
  },
  goindex:function(){
		wx.reLaunch({
      url: '/pages/index/index'
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
     if(!this.data.stops){
       this.data.currentPage++
       this.databind()
     }
  }
})