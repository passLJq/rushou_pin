// pages/other/password/password.js
const app = getApp()
const util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stau: '',//页面展示 0=> 设置 1=> 修改  2=>忘记密码页面
    Length: 6,        //输入框个数
    isFocus: true,    //聚焦
    Value: "",        //输入的内容
    ispassword: true, //是否密文显示 true为密文， false为明文
    passwordset:[],//密码暂保存
    biaotione:'设置密码',
    biaotitwo:'为提高您的支付安全，请设置一个支付密码',
    anniubiaoti:'下一步',
    phone:'',//电话画面提交使用
    showphone:'',//展示用电话
    getyanzhengma:false,//是否获取成功验证码
    yanzhengmaFocus:false,//验证码的聚焦
    smscode:'',//验证码
    smspassword:'',//验证码接口返回的数据
    smlength:4,//验证码个数
    smispassword: false//是否密文显示 true为密文， false为明文
  },
  // 六位数密码框函数
  Focus(e) {
    var that = this;
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue,
    })
  },
  Tap() {
    var that = this;
    that.setData({
      isFocus: true,
    })
  },
  // 四位数密码框函数
  smFocus(e) {
    var that = this;
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      smscode: inputValue,
    })
  },
  smTap(){
    var that = this;
    that.setData({
      yanzhengmaFocus: true,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(options)
    this.setData({
      stau: options.type
    })
    if(options.type=='1'){
      wx.setNavigationBarTitle({
        title: '修改密码'
      })
      this.setData({
        biaotione: '修改密码',
        biaotitwo: '请输入支付密码，完成身份验证',
      })
    }else if(options.type=='0'){
      wx.setNavigationBarTitle({
        title: '设置密码'
      })
    }
  },
  next:function(){
    var that = this
    if (that.data.Value.length!=6){
      app.promsg('密码长度不正确')
      return
    }
    //设置密码
    if(that.data.stau==0){
      //两次密码前端校检
      //第二次密码校检
      if (that.data.passwordset.length==1){
        if (that.testPassWorld(that.data.Value)) {
          //校检两次密码是否相同
          if (that.data.passwordset[0] != that.data.Value){
            app.promsg('两次密码不一致')
            return
          }
          that.setpassword()
          console.log(that.data)
        } else {
          app.promsg('密码格式不正确')
          return
        }
      //第一次密码校检
      } else if (that.data.passwordset.length == 0){
        if (that.testPassWorld(that.data.Value)){
          let ase=[]
          ase.push(that.data.Value)
          that.setData({
            passwordset: ase,
            Value:'',
            biaotione:'确认密码',
            biaotitwo:'请再次确认您的6位数字密码',
            anniubiaoti:'保存'
          })
          console.log(that.data)
        }else{
          app.promsg('密码格式不正确')
          return
        }
      }
      //重新设置密码校检老密码
    } else if (that.data.stau == 1){
      that.setpassword()
    }
  },
  testPassWorld(msg) {
    var counts = "0123456789"
  	var Zcounts = "9876543210"
  	var patrn = /(.)*(.)\2{5}(.)*/g;
    if(msg.length != 6 || counts.indexOf(msg) != -1 || Zcounts.indexOf(msg) != -1 || patrn.exec(msg)) {
        return false
      }else {
        return true
      }
  },
  setpassword:function(){
    var that = this
    let types = ''//1是设置密码，0是校检密码
    var payvalue=''
    //stau钱包密码状态 1=> 验证旧密码和支付提交 0=> 修改 
    if (that.data.stau == 0){
      types=1
      payvalue = that.data.passwordset[0]
    } else if (that.data.stau == 1){
      types = 0
      payvalue = that.data.Value
    } else if (that.data.stau == 2){

    }
    console.log()
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/UpdatePayPwd?devicetype=5&uid=' + wx.getStorageSync('SessionUserID'),
      method:'post',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        paypwd: payvalue,
        type: types //1是设置密码，0是校检密码
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if(ret.data.success&&ret.data.status==1){
          if (that.data.stau == 0){
            app.promsg('设置密码成功')
            setTimeout(function () {
              wx.navigateBack({
                delta: 1
              })
            }, 1000)
            //校检老密码成功
          } else if (that.data.stau == 1){
            that.setData({
              Value: '',
              biaotione: '修改密码',
              biaotitwo: '请设置新的6位数字支付密码',
              anniubiaoti: '下一步',
              stau:0,
            })
          }
        }else{
          app.promsg(ret.data.err)
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      }
    })
  },
  //忘记密码
  wangji:function(){
    var that = this
    this.setData({
      stau:2
    })
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetTelphone?uid=' + wx.getStorageSync('SessionUserID'),
      method: 'get',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        devicetype:5
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
            that.setData({
              Value:'',
              phone: ret.data.Data.telphone,
              showphone: ret.data.Data.telphone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2'),
              anniubiaoti:'获取验证码'
            })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  //获取验证码
  getyanzhengma:function(){
    var that=this
    util.http({
      url: app.globalData.siteUrl + '/Main/Login/sendSMSCode',
      method: 'get',
      data: {
        telphone: that.data.phone,
      },
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
          let a = '验证码已发送至' + that.data.showphone
          that.setData({
            getyanzhengma:true,
            smspassword:ret.data.Data,
            biaotione:'输入验证码',
            biaotitwo: a,
            anniubiaoti:'下一步'
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  //校检验证码
  checkid:function(){
    var that = this
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/CheckCode',
      method: 'get',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        telphone: that.data.phone,
        smscode: that.data.smscode,
        smspassword: that.data.smspassword,
        devicetype: 5
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
          that.setData({
            Value: '',
            biaotione: '修改密码',
            biaotitwo: '请设置新的6位数字支付密码',
            anniubiaoti: '下一步',
            stau: 0,
          })
        } else {
          app.promsg(ret.data.err)
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
    var that=this
    // util.http({
    //   url: app.globalData.siteUrl + '/Main/Member/UpdatePayPwd?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
    //   method:'post',
    //   data: {
    //     uid: wx.getStorageSync('SessionUserID'),
    //     paypwd: paypwd,
    //     type: type
    //   },
    //   loading_icon: state,
    //   header: 1,
    //   successBack: (ret) => {
    //     console.log(ret)
    //   }
    // })
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