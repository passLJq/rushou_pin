// pages/wechatclear/wechatclear.js
const utils = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetMemberJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        devicetype: 5
      },
      header: 1,
      successBack: (ret)=>{
        ret=ret.data
         if(ret.status==1&&ret.success){
           if(ret.Data.iswx==1){
             that.setData({
               name: ret.Data.name
             })
             //不是1则没有绑定, 清除缓存,回到申请开店页面
           }else{
             try {
               wx.clearStorageSync()
               //获取wxsectionkey
               app.loginwx()
             } catch (e) {
               app.alerts('清理失败')
               return
             }
             setTimeout(function(){
               wx.reLaunch({
                 url: '../index/index'
               })
             },500)
           }
         }else{
           app.promsg(ret.err)
         }
      }
    })
  },
  clearup:function(){
    app.alerts('您确定要解绑当前微信号吗？',{
      successBack: () => {
        utils.http({
          url: app.globalData.siteUrl + '/Main/Login/UnbindWx?devicetype=5&uid=' + wx.getStorageSync('SessionUserID'),
          data:{
            uid: wx.getStorageSync('SessionUserID')
          },
          method:'POST',
          header: 1,
          successBack: (ret) => {
            ret = ret.data
            if (ret.status == 1 && ret.success) {
              try {
                wx.clearStorageSync()
                app.loginwx()
              } catch (e) {
                app.alerts('清理失败')
                return
              }
              wx.reLaunch({
                url: '../index/index'
              })
            } else {
              app.promsg(ret.err)
            }
          }
        })
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
  
  }
})