const app = getApp()
//检查用户登录状态
var CheckLoginStatus = {
  checksession: function (callBack) {
    wx.checkSession({
      success: function (ret) {
        console.log(ret)
        if (wx.getStorageSync('SessionUserID')) {
          callBack && callBack()
        }else {
          app.loginwx(callBack)
        }
      },
      fail: function () {
        //登录态过期
        app.loginwx(callBack)
      }
    })
  }
}
module.exports = {
  checksession: CheckLoginStatus.checksession
}