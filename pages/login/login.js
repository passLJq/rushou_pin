// pages/login/login.js
var app=getApp()
const util = require("../../utils/util.js")
var tiomeout
Page({

  /**
   * 页面的初始数据
   */
  data: {
    smspassword:'',			// 验证码返回的数据
    telphone:'',
    smscode  :'',				// 页面的验证码
    clickon:true,				// 点击获取验证码
    time:60,						// 倒计时
    isPageLogin: "",		// 是否是页面点击触发的
    status:1, 					// 1代表已经用户授权 2是没授权
		showInv: false,			// 显示邀请弹窗
		showInv2: false,		// 显示邀请弹窗
		invMsg: '',			  	// 邀请人信息
		invNum: '',					// 邀请码
		uid: '',
		isLogin: false,
		registerId: ''			// 在首次带出邀请人信息，点击取消时把推荐人id存起来
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    options.isPageLogin && this.setData({
      isPageLogin: options.isPageLogin
    })
    //签到活动额标识
    if (options.type) {
      if (options.type == 'qiandao') {
        that.setData({
          qiandao: options.type
        })
      }
    }
		// this.getInvCode()
    // this.jiancha()
  },
  bindgetuserinfo:function(e){
    var that=this
    if (e.detail.userInfo) {
			that.que()
    }else{
      wx.showToast({
        title: "为了您更好的体验,请先同意授权",
        icon: 'none',
        duration: 2000
      });
    }
  },
	// 查询邀请码
	getInvCode() {
		util.http({
			url: app.globalData.siteUrl + '/Main/Member/GetRecommendInvitationCode?devicetype=5',
			data: {
				uid: wx.getStorageSync("registerId")
			},
			successBack: ret => {
				ret = ret.data
				if (ret.status == 1 && ret.success) {
					this.setData({
						invNum: ret.reobj.code,
						invMsg: ret.reobj,
						showInv2: true
					})
					
				} else {
					app.promsg(ret.err)
				}
			}
		})
	},
	getinv(e) {
		this.setData({
			invNum: e.detail.value
		})
	},
	// 点击下一步，校检验证码，获取邀请码对应用户信息
	nextStep() {
		if (!this.data.invNum) return app.promsg('请输入邀请码')
		if (this.data.invNum.length != 6) return app.promsg('邀请码错误')
		util.http({
			url: app.globalData.siteUrl + '/Main/Member/GetCodeUser?uid='+this.data.uid,
			data: {
				code: this.data.invNum
			},
			successBack: ret => {
				let data = ret.data
				if (data.success && data.status == 1) {
					let invMsg = { referee: data.reobj.referee, refereeimg: data.reobj.refereeimg}
					this.setData({
						invMsg
					})
				}else{
          app.promsg(data.err)
        }
			}
		})
	},
  comfirmqu(){
    this.setData({
      invMsg:''
    })
  },
	quxiao() {
		this.setData({
			invMsg: '',
			showInv2: false,
			invNum: '',
			smscode: '',
			registerId: wx.getStorageSync("registerId")		// 点击取消就把推荐人的id存起来，邀请码由用户自己填
		})
		wx.setStorageSync("registerId", '')
	},
	
	// 开实习店主
	openShop() {
		var that = this
		util.http({
			method: 'POST',
			url: app.globalData.siteUrl + '/Main/Member/OpenPracticeShop?uid=' + that.data.uid + '&devicetype=5',
			data: {
				uid: that.data.uid,
				code: that.data.invNum,
				devicetype: 5,
				shopname: that.data.telphone,
				txtwx: that.data.telphone,
				ruid: wx.getStorageSync('registerId') || that.data.registerId,
				notice: '入手全球尖货，优选品质生活',
				formid: 'the formId is a mock one'
			},
			header: 1,
			successBack: ret => {
				ret = ret.data
				if (ret.status == 1 && ret.success) {
					this.que()
				} else {
					app.promsg(ret.err)
				}
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
  
  },
  bind1:function(e){
    this.setData({
      telphone: e.detail.value
    })
    console.log(this.data.telphone)
  },
  bind2: function (e) {
    this.setData({
      smscode  : e.detail.value
    })
  },
  code:function(e){
    var that = this
    if (that.data.telphone.length<11){
      app.promsg('请输入正确的手机号码')
      return
    }
    //进来就开始倒数
    that.setData({
      clickon: false,
    })
    var star = that.data.time
    var times = function () {
      if (star > 0) {
        var a = star--
        that.setData({
          time: a
        })
				// console.log(a)
      } else {
        clearInterval(tiomeout);
        that.setData({
          clickon: true,
          time: 60
        })
      }
    }
    tiomeout = setInterval(times, 1000)
    wx.request({
      url: app.globalData.siteUrl + '/main/Login/SendSMSCode',
      data: {
        telphone: that.data.telphone
      },
      success: function (ret) {
        console.log(ret)
        var ret=ret.data
        if (ret.success) {
          if (ret.status == 1 && ret.Data != null && ret.Data != "") {
            that.setData({
              smspassword: ret.Data
            })
          }else{
            app.alerts(ret.err)
          }
        }
      },
      fail: function (e) {
        console.log(e)
      }
    })
  },
  que:function(e){
    var that = this
    if (that.data.telphone.length < 11) {
      app.promsg('请输入正确的手机号码')
      return
    } else if (that.data.smscode.length < 4){
      app.promsg('请输入正确的验证码')
      return
    }
    if (!/^[1]+[3,4,5,6,7,8,9]+\d{9}$/.test(that.data.telphone)) {
      app.promsg('手机号码格式错误');
      return;
    }
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
          });
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (user) {
							console.log(user)
							// return
              wx.request({
                url: app.globalData.siteUrl + '/main/Login/RegisterByWeChat?devicetype=5',
                data: {
                  telphone: that.data.telphone,
                  smscode: that.data.smscode,
                  smspassword: that.data.smspassword,
                  devicetype: 5,
                  encryptedData: user.encryptedData,
                  iv: user.iv,
                  wxsessionkey: wx.getStorageSync('wxsessionkey'),
									code: that.data.invNum,
									inviterUserId: wx.getStorageSync("registerId") || that.data.registerId
									// inviterUserId: '181128173509710852'
                },
                method:'POST',
                success: function (ret) {
                  wx.hideLoading()
                  console.log("开店了")
                  console.log(ret)
                  var ret=ret.data
									if (ret.success &&ret.status == 1&&ret.data!=''){
                    try {
                      wx.setStorageSync('sessionkey', ret.data.sessionkey)
                      wx.setStorageSync('SessionUserID', ret.data.userid)
                      wx.setStorageSync('fxshopid', ret.data.fxshopid)
                    } catch (e) {

                    }
										if (!that.data.isPageLogin) {
											wx.reLaunch({
												url: '../index/index'
											})
										} else {
											wx.navigateBack({
												delta: 1
											})
										}
										that.setData({
											isLogin: ret.isLogin
										})
									} /*else if (ret.success && ret.status == 44) {
										that.setData({
											showInv: true,
											uid: '',
											isLogin: true
										})
									}*/ else if (ret.success && ret.status == 99) {
										var showInv = wx.getStorageSync("registerId") ? false : true
										that.setData({
											showInv: that.data.registerId ? true : showInv,		// 有存registerId，表示首次带出邀请人时点取消了
											uid: ret.data.uid,
											isLogin: ret.isLogin
										})
										// 有推荐人id就直接跑开店接口直接登录，不需再填邀请码
										if (wx.getStorageSync("registerId")) {
											that.getInvCode()
										}
									} else {
                    app.alerts(ret.err)
                  }
                  console.log(ret)
                },
                fail: function (e) {
                  wx.hideLoading()
                  that.alerts(e)
                }
              })

            }
          })
        }
      },
      fail:function(res){
        console.log(res)
      }
    })

  }
})