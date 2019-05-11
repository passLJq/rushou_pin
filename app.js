//app.js
App({
  onLaunch: function (options) {
    var that = this

    wx.getSystemInfo({
      success: res => {
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          this.globalData.isIphoneX = true
        }
        if (modelmes.indexOf('iPhone X') != -1) {
          this.globalData.isIphoneX = true
        }
      }
    })
      wx.checkSession({
        success: function () {
         
        },
        fail: function () {
          //登录态过期
          that.loginwx()
        }
      })
  },
  onShow: function (){
    var that=this
    if (wx.getStorageSync('wxsessionkey') == '') {
      that.loginwx()
    }
    wx.checkSession({
      fail: function () {
        //登录态过期
        that.loginwx()
      }
    })
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })
  },
  loginwx:function(isPageLogin){
    var that=this
    wx.login({
      success: function (res) {
        if (res.code) {          
          //发起网络请求
          wx.request({
            url: that.globalData.siteUrl +'/main/Login/LoginInWeChat',
            data: {
              code: res.code,
              devicetype :5
            },
            success: function (loginres) {
              console.log(loginres)
              wx.setStorageSync('wxsessionkey', loginres.data.data.wxsessionkey)
              if (loginres && loginres.data.status == 1) {
                try {
                  wx.setStorageSync('sessionkey', loginres.data.data.sessionkey)
                  wx.setStorageSync('SessionUserID', loginres.data.data.userid)
                  wx.setStorageSync('fxshopid', loginres.data.data.fxshopid)
                } catch (e) {
                  that.alerts("数据绑定失败，请重启")
                }
                let pages = getCurrentPages()
                console.log(pages)
                let currentPage = pages[pages.length - 1]
                if (!isPageLogin && (currentPage.route.indexOf("my_index") != -1 || currentPage.route.indexOf("shoppingcar") != -1)) {
                  currentPage.onShow()
                }else if (isPageLogin && typeof isPageLogin == "function") {
                  isPageLogin()
                }
                if (isPageLogin && isPageLogin === "prompt_box") {
                  if (currentPage.route.indexOf("yshopapply") != -1 && pages.length > 1) {
                    wx.navigateBack({
                      delta: 1
                    })
                  }else {
                    if (currentPage.route.indexOf("index/index") !== -1) {
                      currentPage.onShow()
                    } else {
                      wx.switchTab({
                        url: '/pages/index/index'
                      })
                    }
                    wx.hideLoading()
                  }
                }
              } else if (loginres && loginres.data.status== 99) {
                wx.navigateTo({
                  url: '/pages/login/login?isPageLogin=1'
                })
              }else if (loginres.data.status == 100) {
                if (isPageLogin) {
                  wx.navigateTo({
                    url: '/pages/login/login?isPageLogin=1'
                  })
                }

                //100代表新用户
                // sessionkey = loginres.data.data.sessionkey
                // wx.setStorageSync('sessionkey', sessionkey)
                // wx.setStorageSync('sessionID', sessionid)
                // wx.setStorageSync('wxsessionkey', loginres.data.data.wxsessionkey)
              }else{
                that.alerts(loginres.data.err)
              }
              wx.hideLoading()
            },
            fail: function (e) {
              wx.hideLoading()
              that.alerts(e)
            }
          })
        } else {
          that.alerts('获取用户登录态失败！' + res.errMsg)
        }
      }, fail:function (err) {
        console.log(err)
        that.alerts('获取用户登录态失败！' + err.errMsg)
      }
    })
  },
  globalData: {
    userInfo: null,
    // siteUrl: 'https://w.rushouvip.cn/api',
		siteUrl: 'https://pinw.rushouvip.cn/api',
    memberSiteUrl:'https://i.rushouvip.cn/',
    isIphoneX: false
  },
  showtips: function (message) {
    if (!message) return
    wx.showToast({
      title: message.toString(),
      duration: 1300,
      mask: true
    })
  },
  alerts: function (message, ...msg) {
    if (!message) return
    let titleName = "友情提示"
    if (msg.length> 0 && msg[0].title) {
      titleName = msg[0].title
    }
    wx.showModal({
      title: titleName,
      content: message,
      showCancel: msg[0] && msg[0].showCancel? false: true,
      confirmText: msg[0] && msg[0].confirmText || "确定",
      confirmColor: msg[0] && msg[0].confirmColor || "#3CC51F",
      success: function (res) {
        if (res.confirm) {
          msg.length > 0 && msg[0].successBack && msg[0].successBack()
        } else if (res.cancel) {
          msg.length > 0 && msg[0].cancleBack && msg[0].cancleBack()
        }
      }
    })
  },
  //没有图标的弹窗
  promsg: function (message){
    if (!message) return
    setTimeout(function(){
      wx.showToast({
        title: message.toString(),
        icon: 'none',
        duration: 3000
      });
    },100)
  },
  //有图标的弹窗
  showLoading: function (message) {
    if(!message) return
    wx.showLoading({
      title: message.toString(),
      icon: 'loading',
      mask: true
    });
  }
})