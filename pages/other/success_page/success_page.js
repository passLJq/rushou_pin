// pages/other/success_page/success_page.js
var app = getApp()
var interval;
var varName;
var ctx = wx.createCanvasContext('canvasArcCir');
const util = require("../../../utils/util.js")
const sharebox = require('../../../Component/sharebox/sharebox.js')
var tiomeout = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgdata: '',
    allping: '',//拼团一共需要多少人
    days: '',
    hours: '00',
    minutes: '00',
    seconds: '00',
    showshare: [false, true], //分享控制
    showtan: false,//分享后的第二个弹窗
     video: 1, //1是还没开始录音，2是录音中，3是停止
    src: '', //录音存放
    openvideo: false,
    videosaid: true, //播放时状态 true是没播放，false是播放中
    bosrc: '../../../image/CombinedShape.png',
    videotime: '',
    datas: '',
    status: 1 ,//1是授权了，2是没授权录音
    once:false
  },
  toIndex() {
    if (this.data.options.way == 'lndiana') {
			wx.navigateTo({
        url: '/pages/lndiana/lndiana',
      })
      return
    }
		wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  toOrders() {
    if (this.data.options.way == 'lndiana') {
      // 需要分享就跳转分享提示页
      console.log(this.data.options.isshare)
      if (this.data.options.isshare == 1) {
        wx.redirectTo({
          url: '/pages/lndianaShare/lndianaShare?cid=' + this.data.options.cid,
        })
      } else {
        wx.redirectTo({
          url: '/pages/mylndiana/mylndiana',
        })
      }

      // wx.redirectTo({
      //   url: '/pages/mylndiana/mylndiana',
      // })
      return
    }
		wx.reLaunch({
      url: '/pages/my_index/my_index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        options: options
      })
    var that = this;
    //检查录音授权
    that.checkluying()
    // if (options.type == "xiugai") {
    //   if (options.record != '') {
    //     that.setData({
    //       video: 3,
    //       src: options.record,
    //       videotime: options.recordtime
    //     })
    //   }
    //   that.setData({
    //     texts: options.share,
    //     nowcount: options.share.length,
    //   })
    // }
    //录音
    this.recorderManager = wx.getRecorderManager();
    this.recorderManager.onError(function (res) {
      console.log(res)
      that.tip("录音失败！")
    });
    this.recorderManager.onStop(function (res) {
      var time = (res.duration / 1000).toFixed(0)
      that.setData({
        video: 3,
        src: res.tempFilePath,
        videotime: time
      })
      console.log(res.tempFilePath)
    });

    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onError((res) => {
      that.tip("播放录音失败！")
    })
    this.innerAudioContext.onEnded((res) => {
      //自然结束播放事件
      that.setData({
        bosrc: '../../../image/CombinedShape.png',
        videosaid: true
      })
    })

    //创建并返回绘图上下文context对象。
    var cxt_arc = wx.createCanvasContext('canvasCircle');
    cxt_arc.setLineWidth(4);
    cxt_arc.setStrokeStyle('#e8e8e8');
    cxt_arc.setLineCap('round');
    cxt_arc.beginPath();
    cxt_arc.arc(35, 35, 30, 0, 2 * Math.PI, false);
    cxt_arc.stroke();
    cxt_arc.draw();
  },
  //检查录音授权
  checkluying: function () {
    var that = this;
    wx.getSetting({
      success(res) {
        console.log(res)
        if (!res.authSetting['scope.record']) {
          console.log(1)
          wx.authorize({
            scope: 'scope.record',
            success(ret) {
              that.setData({
                status: 1
              })
            },
            fail(ret) {
              that.setData({
                status: 2
              })
            }
          })
        } else {
          that.setData({
            status: 1
          })
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
    if (this.data.options.way =='groupbuynow'){
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetMyGroupbuyDetails?devicetype=5',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        ogid:that.data.options.ogid
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        ret = ret.data
        if (ret.status == 1 && ret.success) {
          var that = this
          clearInterval(tiomeout);
          //有几个人需要参团
          let allping = []
          for (var i = 0; i < (ret.Data[0].gbcount - 1); i++) {
            allping.push(1)
          }
          let remaintime=''
          let groudtimes=''
          remaintime = ret.Data[0].ts - ret.Data[0].resobj[0].tpgap;
          console.log(remaintime)
          //倒计时
          if (remaintime > 0) {
            groudtimes = function () {
              if (remaintime <= 0) {
                clearInterval(tiomeout);
                return;
              }
              var showhtml = "";
              remaintime = remaintime - 1;
              var days = parseInt(remaintime / 60 / 60 / 24); 			/*计算剩余的天数*/
              var hours = parseInt(remaintime / 60 / 60 % 24); 		/*计算剩余的小时*/
              var minutes = parseInt(remaintime / 60 % 60);		/*计算剩余的分钟*/
              var seconds = parseInt(remaintime % 60);		/*计算剩余的秒数*/
              if (days != 0) {
                showhtml += days + "天";
              }
              if (hours != 0) {
                showhtml += hours + "：";
              }
              minutes = that.checkTime(minutes);
              seconds = that.checkTime(seconds);
              that.setData({
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds
              })
            }
            tiomeout = setInterval(groudtimes, 1000)
          }else{
            clearInterval(tiomeout);
          }
          this.setData({
            msgdata:ret.Data[0],
            allping: allping
          })
        } else {
          app.promsg(ret.err)
        }
      }
    })
  }
  },
  checkTime: function (i) { //将0-9的数字前面加上0，例1变为01
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  //弹出分享框
  goshare: function () {
    this.setData({
      showshare: [true, true],
      showtan:false
    })
  },
  //关闭分享框
  closeshare: function (index) {
    //1是生成海报时观点弹出框但保留遮罩层
    if (index == 1) {
      this.setData({
        showshare: [true, false]
      })
    } else {
      sharebox.closeshare(this)
    }
  },
  //分享到朋友圈生成图片
  sharequan: function (that) {
    var that = this
    sharebox.sharequan(that, 2, 'group')
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
  //关闭二次弹窗
  closesharebox:function(){
    this.setData({
      showtan: false
    })
  },
  drawCircle: function () {
    //检查授权
    var that = this
    wx.getSetting({
      success(res) {
        console.log(res)
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success(ret) {
              console.log(ret)
              that.opense()
            },
            fail(ret) {
              wx.openSetting({
                success: (res) => { }
              })
            }
          })
        } else {
          that.opense()
        }
      },
      fail(res) {
        app.promsg('授权失败，无法使用')
      }
    })
  },
  //画圈
  opense: function () {
    var that = this
    clearInterval(varName);

    function drawArc(s, e) {
      ctx.setFillStyle('white');
      ctx.clearRect(0, 0, 100, 100);
      ctx.draw();
      var x = 35,
        y = 35,
        radius = 30;
      ctx.setLineWidth(4);
			ctx.setStrokeStyle('#FF4C5F');
      ctx.setLineCap('round');
      ctx.beginPath();
      ctx.arc(x, y, radius, s, e, false);
      ctx.stroke()
      ctx.draw()
    }
    var step = 1,
      startAngle = 1.5 * Math.PI,
      endAngle = 0;
    var animation_interval = 10,
      n = 5800;
    var animation = function () {
      if (step <= n) {
        endAngle = step * 2 * Math.PI / n + 1.5 * Math.PI;
        drawArc(startAngle, endAngle);
        step++;
      } else {
        clearInterval(varName);
      }
    };
    varName = setInterval(animation, animation_interval);
    that.startRecordMp3()
    that.setData({
      video: 2
    })
  },
  // 暂停画圈
  stopcircle: function () {
    clearInterval(varName);
    this.stopRecord()
  },
  /*** 提示*/
  tip: function (msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false
    })
  },
  //弹出
  ales: function (e) {
    var that = this
    wx.showModal({
      title: '友情提示',
      content: '您确认删除这段语言吗？',
      confirmColor: '#FF422C',
      success: function (res) {
        if (res.confirm) {
          that.delevied(e)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }

  // /**
  //  * 录制aac音频
  //  */
  // , startRecordAac: function () {
  //   this.recorderManager.start({
  //     format: 'aac'
  //   });
  // }

  /*** 录制mp3音频*/
  ,
  startRecordMp3: function () {
    this.recorderManager.start({
      format: 'mp3'
    });
  }

  /*** 停止录音*/
  ,
  stopRecord: function () {
    this.recorderManager.stop()
  }

  /**
   * 播放录音
   */
  ,
  playRecord: function () {
    var that = this;
    var as = this.data.videosaid
    if (as) {
      var src = this.data.src;
      if (src == '') {
        this.tip("请先录音！")
        return;
      }
      this.innerAudioContext.src = this.data.src;
      this.innerAudioContext.play()
      this.setData({
        bosrc: '../../../image/CombinedShape1.gif',
        videosaid: false
      })
    } else if (!as) {
      this.setData({
        bosrc: '../../../image/CombinedShape.png',
        videosaid: true
      })
    }
  },
  //打开录音
  openvied: function (e) {
    //dataset.que=1表示确认按钮关闭录音盒子
    var that=this
    if (this.data.video == 1 ) {
      var a = !this.data.openvideo
      this.setData({
        openvideo: a
      })
    } else if (e.currentTarget.dataset.que == 1){
      if (that.data.once){
        return
      }
      that.setData({
        once:true
      })
      //新录音上传
      wx.uploadFile({
        url: app.globalData.memberSiteUrl + '/Ajax/FileUpload.ashx', 
        filePath: that.data.src,
        name: 'file',
        header: {
          "Content-Type": "application/json; charset=utf-8"
        },
        success: function (ret) {
          var data = ret.data
          //不支持单引号转换为双引号
          data = JSON.parse(data.replace(/\'/ig, "\""));
          if (data.success == 1) {
            var locsrc = data.fullurl
            util.http({
              url: app.globalData.siteUrl + '/Marketing/Groupbuy/SaveGBShareVoice?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
              method: 'post',
              data: {
                ogid: that.data.options.ogid,
                orderid: that.data.options.orderid,
                sharevoice: unescape(locsrc),
                sharevoicelength: that.data.videotime
              },
              header: 1,
              successBack: (ret) => {
                console.log(ret)
                if (ret.data.success && ret.data.status==1){
                  var a = !that.data.openvideo
                  that.setData({
                    openvideo: a,
                    once: false
                  })
                  console.log(1)
                }else{
                  app.promsg(ret.data.err)
                  that.setData({
                    once: false
                  })
                }
              }
            })
          } else {
            that.setData({
              once: false
            })
            app.promsg(data.error)
          }
        }
      })
    }
  },
  //删除录音
  delevied: function (e) {
    var that = this;
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/SaveGBShareVoice?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
      method: 'post',
      data: {
        ogid: that.data.options.ogid,
        orderid: that.data.options.orderid,
        sharevoice: '',
        sharevoicelength: ''
      },
      header: 1,
      successBack: (ret) => {
        if (ret.data.success && ret.data.status == 1) {
          that.setData({
            src: '',
            video: 1,
            videosaid: true
          })
          //1表示重新录制按钮
          if (e.currentTarget.dataset.del == 1) {
            that.openvied()
          }
          //重新画第二圆 让进度条恢复原来
          ctx.setFillStyle('white');
          ctx.clearRect(0, 0, 100, 100);
          ctx.draw();
          ctx.setLineWidth(4);
          ctx.setStrokeStyle('#eaeaea');
          ctx.setLineCap('round');
          ctx.beginPath();
          ctx.arc(35, 35, 30, 0, 2 * Math.PI, false);
          ctx.stroke()
          ctx.draw()
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    tiomeout = ''
    clearInterval(tiomeout);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    tiomeout = ''
    clearInterval(tiomeout);
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
  onShareAppMessage: function () {
    var that = this
    let ruid = wx.getStorageSync('SessionUserID')
    if (that.data.options.ruid) {
      ruid = that.data.options.ruid
    }
    this.setData({
      showtan: true
    })
    that.closeshare()
    return {
			title: '【仅剩' + that.data.msgdata.count + '个名额】我' + that.data.msgdata.gbprice + '元拼了' + that.data.msgdata.gbtitle,
      imageUrl: that.data.msgdata.gbimg || that.data.msgdata.proimage,
      path: '/pages/group_detail/group_detail?orderid=' + that.data.msgdata.orderid + '&ruid=' + ruid
    }
  }
})