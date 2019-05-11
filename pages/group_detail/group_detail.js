// pages/group_detail/group_detail.js
var app = getApp()
var interval;
var varName;
var ctx = wx.createCanvasContext('canvasArcCir');
const util = require("../../utils/util.js")
const sharebox = require('../../Component/sharebox/sharebox.js')
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")

var tiomeout_ores=''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onec:false,//第一次进来不运行onshwo生命函数
    msgdata:'',
		msg: '',
    commit:'',//提示语
    allping:'',//拼团一共需要多少人
    days: '',
    hours: '00',
    minutes: '00',
    seconds: '00',
    btnmessg:'',
    showshare: [false, true], //分享控制
    overtime:false,//倒计时结束了，手动变失败
    video: 1, //1是还没开始录音，2是录音中，3是停止
    src: '', //录音存放
    openvideo: false,
    videosaid: true, //播放时状态 true是没播放，false是播放中
    bosrc: '../../image/CombinedShape.png',
    videotime: '',
    datas: '',
    status: 1,//1是授权了，2是没授权录音
    once: false,
    ishead:false,//判断自己是否为团长

    skuBoxBottom: false,
		specData: '',
		ptData: '',
		ptDetailData: '',
    // spec: '',         // 规格数据
    // gbsku: '',        // 拼团规格
    // skutext: '',
    // specval: '',
    // skuid: '',
    // gbskuid: '',
    // buyPrice: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    //scene是二维码进来的
    console.log(options)
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      console.log(scene)
      util.diz(scene, 76, 11, function (ret) {
        let aall = []
        aall = ret.data.nValue.split("A")
        console.log(aall)
        //判断分享人是不是自己打开
        if (aall[1] == wx.getStorageSync('SessionUserID')){
          that.setData({
            options: {
              orderid: aall[0],
              ruid:''
            }
          })
        }else{
          that.setData({
            options: {
              orderid: aall[0],
              ruid: aall[1]
            }
          })
        }
        that.bindata()
      })
    }else{
      if (options.ruid == wx.getStorageSync('SessionUserID')){
        that.setData({
          options: {
            orderid: options.orderid
          }
        }) 
      }else{
        that.setData({
          options: options
        })
      }
      that.bindata()
    }
    var that = this;
    //检查录音授权
    that.checkluying()
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
        bosrc: '../../image/CombinedShape.png',
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
	showSku() {
		this.setData({
			skuBoxBottom: false
		})
	},
  bindata: function (options){
    var that=this
    setTimeout(function(){
      that.data.onec = true
    },1000)
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetGBOrder?devicetype=5',
      data: {
        orderID: that.data.options.orderid,
        uid: wx.getStorageSync('SessionUserID')
      },
      successBack: (ret) => {
        console.log(ret)
        ret = ret.data
        if (ret.status==1&&ret.success) {
          clearInterval(tiomeout_ores);
          let remaintime = ''
          let commit = ''
          var agroudtimes=''
          var btnmessg=''
          var overtime=false
					if (ret.Data.gbstate == 1 && ret.Data.count >= ret.Data.gbnum) {
						ret.Data.gbstate = 2
					}
          if (ret.Data.gbstate == 1) {
            //有这个参数代表和没参加这个拼团
            if (!ret.Data.hasjoin){
              btnmessg='和TA一起拼'
            }else{
              btnmessg = '分享给好友'
            }
            commit = "拼团中，赶紧来和我拼团抢好物吧"
            remaintime = ret.Data.ts - ret.Data.tpgap;
            console.log(remaintime)
            //倒计时
            if (remaintime > 0) {
              agroudtimes = function (){
                if (remaintime <= 0) {
                  clearInterval(tiomeout_ores);
                //有这个参数代表和没参加这个拼团
                  if (!ret.Data.hasjoin) {
                    btnmessg = '我也发起拼团'
                    commit = "此单已失效，快去看看别的拼单吧"
                  } else {
                    btnmessg = '重新开团'
                    commit = "拼团失败，您可以重新发起拼团"
                  }
                  overtime = true
                  that.setData({
                    commit: commit,
                    btnmessg: btnmessg,
                    overtime: overtime
                  })
                  return;
                }
                var showhtml = "";
                remaintime = remaintime - 1;
                var days = parseInt(remaintime / 60 / 60 / 24); //计算剩余的天数
                var hours = parseInt(remaintime / 60 / 60 % 24); //计算剩余的小时
                var minutes = parseInt(remaintime / 60 % 60);//计算剩余的分钟
                var seconds = parseInt(remaintime % 60);//计算剩余的秒数
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
              tiomeout_ores = setInterval(agroudtimes, 1000)
              //后台有延迟 直接前端
            }else{
              clearInterval(tiomeout_ores);
              //有这个参数代表和没参加这个拼团
              if (!ret.Data.hasjoin) {
                btnmessg = '我也发起拼团'
                commit = "此单已失效，快去看看别的拼单吧"
              } else {
                btnmessg = '重新开团'
                commit = "拼团失败，您可以重新发起拼团"
              }
            }
          } else if (ret.Data.gbstate == 2) {
           //有这个参数代表和他完成拼团了
            if (!ret.Data.hasjoin) {
              btnmessg = '我也发起拼团'
              commit = '此单已成团，快去看看别的拼单吧'
            } else {
              btnmessg = '查看订单详情'
              commit = '拼团成功，商品很快就来到你身边'
            }
          } else{
            //有这个参数代表和他完成拼团了
            if (!ret.Data.hasjoin) {
              btnmessg = '我也发起拼团'
              commit = "此单已失效，快去看看别的拼单吧"
            } else {
              btnmessg = '重新开团'
              commit = "拼团失败，您可以重新发起拼团"
            }
          }
          //有几个人需要参团
          let allping = []
					let allpingNum = 2
					allpingNum = ret.Data.count > ret.Data.gbnum ? ret.Data.count : ret.Data.gbnum
					for (var i = 0; i < (allpingNum - 1); i++) {
            allping.push(1)
          }
          //判断是否有分享录音和是否是团长，团长允许修改
          let savevoice=false
          if (ret.Data.sharevoice!= '') {
            that.setData({
              video: 3,
              src: ret.Data.sharevoice,
              videotime: ret.Data.sharevoicelength
            })
          }
          if (ret.Data.headuid == wx.getStorageSync('SessionUserID')){
            savevoice = true
          }
          that.setData({
            msgdata: ret.Data,
            commit: commit,
            allping: allping,
            btnmessg: btnmessg,
            overtime: overtime,
            ishead:savevoice
          })
					// this.getProductMsg(ret.Data.gbid, ret.Data.proid)
					this.getOpenGroupData()
          // 读规格参数
          if (ret.Data.gbskucount > 0) {
            this.getSku()
          }

        } else {
          app.promsg(ret.err)
        }
      }
    })
  },
	// 获取拼团商品信息
	getProductMsg(gbid, gbproid) {
		util.http({
			url: app.globalData.siteUrl + '/Main/Main/GetProductDetailJson',
			data: {
				productId: gbproid,
				gbid: gbid,
				userid: wx.getStorageSync("SessionUserID"),
				fxshopid: wx.getStorageSync('fxshopid')
			},
			// header: 1,
			successBack: this.msgSuccessBack
		})
	},
	// 拼团商品信息成功回调函数
	msgSuccessBack(ret) {
		if (ret.data.success && ret.data.status == 1) {
			const data = ret.data.Data
			// console.log(url)
			this.setData({
				msg: data,
			})
		} else {
			app.promsg(ret.data.err)
		}

	},
  // 读取规格数据
  getSku() {
    var that = this
    util.http({
      url: app.globalData.siteUrl + '/Main/Main/GetProductSkuJson',
      data: {
        productId: that.data.msgdata.proid,
        gbid: that.data.msgdata.gbid
      },
      successBack: (ret) => {
        console.log(ret)
        let data = ret.data.Data
        // let bus = ''
        // //拼团读另一个规格
        // bus = data.gbsku[0].gbskuPrice.toFixed(2)
        this.setData({
					specData: data
          // spec: data.spec,
          // gbsku: data.gbsku,
          // gbskuid: data.gbsku[0].gbroductskuid,
          // sku: data.sku,
          // skutext: data.sku[0].skutext,
          // specval: data.sku[0].specval,
          // skuid: data.sku[0].skuid,
          // buyPrice: bus,
        })
      }
    })
  },
	getOpenGroupData() {
		// 获取参团信息
		util.http({
			url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetMyGroupbuyDetails',
			data: {
				ogid: this.data.msgdata.ogid,
				uid: wx.getStorageSync('SessionUserID')
			},
			successBack: (ret) => {
				console.log(ret)
				if (ret.data.success && ret.data.status == 1) {
					let data = ret.data.Data[0]
					data.orderid = this.data.msgdata.ogid
					data.resobj.forEach(item => {
						if (!item.userimg) {
							item.userimg = '../../image/man.jpg'
						}
					})
					this.setData({
						ptDetailData: data,
					})
				} else {
					app.promsg(ret.data.err)
				}
			}
		})
	},
  // changSku(e) {
  //   var that = this
  //   var oldspecval = this.data.specval.split(",")
  //   oldspecval[e.currentTarget.dataset.len] = e.currentTarget.dataset.valueid
  //   this.setData({
  //     specval: oldspecval.toString()
  //   })
  //   this.data.sku.forEach((item, idx) => {
  //     let bus = ''
  //     //拼团读另一个规格
  //     bus = Number(this.data.gbsku[idx].gbskuPrice).toFixed(2)
  //     item.specval == this.data.specval && this.setData({
  //       skuid: this.data.sku[idx].skuid,
  //       gbskuid: this.data.gbsku[idx].gbroductskuid,
  //       specval: this.data.sku[idx].specval,
  //       skutext: this.data.sku[idx].skutext,
  //       buyPrice: bus,
  //     })
  //   })
  // },
  // // 拼团
  // realgbuy() {
  //   var that = this
  //   CheckLoginStatus.checksession(() => {
  //     // 有规格参团
  //     wx.navigateTo({
  //       url: '/pages/ordercomfirm/ordercomfirm?way=groupbuynow&buyCounts=1&skutext=' + that.data.skutext + '&skuid=' + that.data.skuid + '&gbprice=' + that.data.buyPrice + '&pid=' + that.data.msgdata.proid + '&gbid=' + that.data.msgdata.gbid + '&ogid=' + that.data.msgdata.ogid + '&gbskuid=' + that.data.gbskuid
  //     })
  //   })
  // },
  checkTime: function(i){ //将0-9的数字前面加上0，例1变为01
    if(i<10) {
      i = "0" + i;
    }
    return i;
  },
  //回到首页
  goindex:function(){
			wx.reLaunch({
        url: '/pages/index/index',
      })
  },
  gobuy:function(){
    console.log(1111)
    var that=this
    if (that.data.msgdata.gbstate == 1 && that.data.options.ruid){
      if (that.data.msgdata.gbskucount > 0) {
        that.setData({
          skuBoxBottom: true
        })
        return
      }
      CheckLoginStatus.checksession(() => {
				that.buypro()
			})
      return
    }
    //后台有延迟 倒计时结束走这里
    if (that.data.overtime){
      wx.navigateTo({
        url: `/pages/groupbuy/groupbuy?gbid=${that.data.msgdata.gbid}&pid=${that.data.msgdata.proid}`
      })
      return
    }
    if (that.data.msgdata.gbstate==1){
      that.goshare()
    } else if (that.data.msgdata.gbstate >= 3){
      wx.navigateTo({
        url: `/pages/groupbuy/groupbuy?gbid=${that.data.msgdata.gbid}&pid=${that.data.msgdata.proid}`
      })
      //拼单完成了别人打开时
    } else if (that.data.msgdata.gbstate == 2&&that.data.options.ruid){
			wx.navigateTo({
				url: `/pages/groupbuy/groupbuy?gbid=${that.data.msgdata.gbid}&pid=${that.data.msgdata.proid}`
			})
    }
  },
  //和别人一起拼单
  buypro(){
    var that=this
    util.http({
      url: app.globalData.siteUrl + '/Main/Shopping/CheckGroupBuyStatus?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        gbid: that.data.msgdata.gbid
      },
      header: 1,
      successBack: (ret) => {
        if (ret.data.status == 1 && ret.data.success) {
          let way = 'groupbuynow'
          wx.navigateTo({
            url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + that.data.msgdata.proskutext + '&skuid=' + that.data.msgdata.proskuid + '&gbprice=' + that.data.msgdata.gbprice + '&pid=' + that.data.msgdata.proid + '&ogid=' + that.data.msgdata.ogid + '&gbid=' + that.data.msgdata.gbid+'&ruid='+that.data.options.ruid
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  //弹出分享框
  goshare: function () {
    this.setData({
      showshare: [true, true]
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
    sharebox.sharequan(that, 1, 'group')
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
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
    if(this.data.onec){
      this.bindata()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    tiomeout_ores = ''
    clearInterval(tiomeout_ores);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    tiomeout_ores = ''
    clearInterval(tiomeout_ores);
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
      ctx.setStrokeStyle('#CDA86E');
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
        bosrc: '../../image/CombinedShape1.gif',
        videosaid: false
      })
    } else if (!as) {
      this.setData({
        bosrc: '../../image/CombinedShape.png',
        videosaid: true
      })
    }
  },
  //打开录音
  openvied: function (e) {
    //dataset.que=1表示确认按钮关闭录音盒子
    var that = this
    if (this.data.video == 1) {
      var a = !this.data.openvideo
      this.setData({
        openvideo: a
      })
    } else if (e.currentTarget.dataset.que == 1) {
      if (that.data.once) {
        return
      }
      that.setData({
        once: true
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
            console.log(unescape(locsrc))
            util.http({
              url: app.globalData.siteUrl + '/Marketing/Groupbuy/SaveGBShareVoice?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
              method: 'post',
              data: {
                ogid: that.data.msgdata.ogid,
                orderid: that.data.options.orderid,
                sharevoice: unescape(locsrc),
                sharevoicelength: that.data.videotime
              },
              header: 1,
              successBack: (ret) => {
                console.log(ret)
                if (ret.data.success && ret.data.status == 1) {
                  var a = !that.data.openvideo
                  that.setData({
                    openvideo: a,
                    once: false
                  })
                  that.bindata()
                } else {
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
        ogid: that.data.msgdata.ogid,
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that=this
    let ruid = wx.getStorageSync('SessionUserID')
    if (that.data.options.ruid){
      ruid = that.data.options.ruid
    }
    // console.log('/pages/group_detail/group_detail?orderid=' + that.data.options.orderid+'&ruid='+ruid)
		var num = that.data.msgdata.num <= 0 ? 0 : that.data.msgdata.num
    return {
			title: '【仅剩' + num + '个名额】我' + that.data.msgdata.gbprice + '元拼了' + that.data.msgdata.sharetitle,
      imageUrl: that.data.msgdata.proimage,
      path: '/pages/group_detail/group_detail?orderid=' + that.data.options.orderid+'&ruid='+ruid,
      success: function (res) {
        // 转发成功
        app.showtips('转发成功')
      },
      fail: function (res) {
        // 转发失败
        app.promsg('转发失败')
      }
    }
  }
})