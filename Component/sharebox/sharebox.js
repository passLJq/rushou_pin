const app = getApp()
const utils = require('../../utils/util.js')

function noscoll() {
  //禁止遮罩层滑动
}

function closeshare(that) {
  that.setData({
    showshare: [false, true]
  })
  console.log(111)
}
//下载图片异步处理
function downImgPic(srctring) {
  return new Promise((resolve, reject) => {
    console.log(srctring)
    wx.getImageInfo({
      //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
      src: String(srctring.replace('http://', 'https://')),
      success: function(res) {
				console.log(res)
        resolve(res)
      },
      fail: function(err) {
        reject()
      }
    })
  })
}
//圆形头像
function circleImg(ctx, img, x, y, r) {
  ctx.save();
  var d = 2 * r;
  var cx = x + r;
  var cy = y + r;
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(img, x, y, d, d);
  ctx.restore();
}
//文字换行解析
function textline(str, ctx, initX, initY, lineHeight, maxWidth){
  var lineWidth = 0;
  var canvasWidth = ctx.width;
  var lastSubStrIndex = 0;
  var columns = 0;
  for (var i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width;
    if (lineWidth > maxWidth && columns < 2) {//减去initX,防止边界出现的问题
      columns += 1
      ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
      initY += lineHeight;
      lineWidth = 0;
      lastSubStrIndex = i;
    } else if ((maxWidth - lineWidth) <= 40 && columns > 0) {
      ctx.fillText(str.substring(lastSubStrIndex, i) + "...", initX, initY);
      return;
    } else if ((maxWidth - lineWidth) >=0 && columns == 1 && i == (str.length - 1)){
      ctx.fillText(str.substring(lastSubStrIndex, i+1), initX, initY);
      return;
    }
     else if ((maxWidth - lineWidth) >0 && columns ==0&&i==(str.length-1)){
      ctx.fillText(str.substring(lastSubStrIndex, i+1), initX, initY);
      return;
    }
  }
}
//分享到朋友圈生成图片
//sharptye 1是group_detail页面 2是success_page页面 3是lndianaShare页面
//types group是拼团分享海报 lndiana是夺宝分享海报
//currentPic 是团长页邀请海报上，背景图索引
function sharequan(that, sharptye, types, currentPic) {
  var sharethis = this
  var ruid
  wx.showLoading({
    title: '生成海报中...',
    mask:true
  })
  //清空海报
  that.setData({
    haibao: ''
  })
  //关闭分享框
  that.setData({
    showshare: [true, false]
  })
  let proimg=[]
  //图片下载地址
  if (types =='group'){
    let orderid = ''
    if (sharptye == 1) {
      let ruid = that.data.options.ruid || wx.getStorageSync("SessionUserID")
      orderid = that.data.options.orderid + 'A' + ruid
    } else if (sharptye == 2){     
      orderid = that.data.msgdata.orderid + 'A' + wx.getStorageSync("SessionUserID")
		} else if (sharptye == 3) {
			orderid = wx.getStorageSync("SessionUserID") + 'A' + that.data.groupBuyList.gbid
		}
    utils.diz(orderid, 11, 76, function (ret) {
      if (sharptye == 1) {
        var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ret.data.nValue + '&page=pages/group_detail/group_detail&width=430&devicetype=5'
        console.log(erweima)
				proimg = [that.data.msgdata.imgphoto, that.data.msgdata.shareimg || that.data.msgdata.proimage, erweima]
        // proimg = [that.data.msgdata.imgphoto, that.data.msgdata.imgphoto, erweima]
      } else if (sharptye == 2) {
        var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ret.data.nValue + '&page=pages/group_detail/group_detail&width=430&devicetype=5'
        proimg = [that.data.msgdata.resobj[0].userimg, that.data.msgdata.resobj[0].userimg, erweima]
      } else if (sharptye == 3) {
				var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=A' + ret.data.nValue + '&page=pages/groupbuy/groupbuy&width=430&devicetype=5'
				console.log(erweima)
				proimg = [that.data.userMsg.pic || '../../image/man.jpg', that.data.groupBuyList.shareimg || that.data.groupBuyList.proimg, erweima]
			}
			console.log(proimg)
      //下载图片
      downImgPic(proimg[0]).then(function (res) {
        proimg.splice(0, 1, res.path)
        downImgPic(proimg[1]).then(function (ress) {
					console.log(ress.path)
          proimg.splice(1, 1, ress.path)
          downImgPic(proimg[2]).then(function (resss) {
						proimg.splice(2, 1, resss.path)
            //拼团画画
            if (sharptye == 3) {
							downImgPic('https://images.rushouvip.cn/IMG/groupbuyBack.png').then(function (rest) {
								proimg.push(rest.path)
								newPT(that, proimg, sharptye)
							}).catch(function () {
								app.promsg('海报绘制失败')
								wx.hideLoading
							})
						} else {
							drawpingtuan(that, proimg, sharptye)
						}
          }).catch(function () {
            app.promsg('二维码获取失败')
            wx.hideLoading
          })
        }).catch(function () {
          app.promsg('商品图片获取失败')
          wx.hideLoading
        })
      }).catch(function (e) {
        app.promsg('头像获取失败')
        wx.hideLoading
      })
    })
  } else if (types == 'lndiana') {
    let imgArr = []
    if (sharptye == 3) {
      // 1 用户头像  2 商品图片  3 二维码
      let str = ''
      str += that.data.options.cid || that.data.options.cloudid
      str += 'A'
      str += wx.getStorageSync("SessionUserID")
      utils.diz(str, 11, 76, function (ret) {
        var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ret.data.nValue + '&page=pages/lndiresult/lndiresult&width=430&devicetype=5'
        console.log(ret.data.nValue)
        imgArr = [that.data.userData.userimg, that.data.msg.proimg, erweima]
        // 下载图片
        downImgPic(imgArr[0]).then(function (res) {
          imgArr.splice(0, 1, res.path)
          downImgPic(imgArr[1]).then(function (ress) {
            imgArr.splice(1, 1, ress.path)
            downImgPic(imgArr[2]).then(function (resss) {
              imgArr.splice(2, 1, resss.path)
              //获取图片完毕 开始画画
              console.log(imgArr)
              drawduobao(that, imgArr, sharptye)
            }).catch(function (e) {
              console.log(e)
              app.promsg('二维码获取失败')
              wx.hideLoading
            })
          }).catch(function () {
            app.promsg('商品图片获取失败')
            wx.hideLoading
          })
        }).catch(function (e) {
          app.promsg('头像获取失败')
          wx.hideLoading
        })
      }) 
    }
  } else if (types == 'ping') {
		var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + wx.getStorageSync("SessionUserID") + '&page=pages/index/index&width=430&devicetype=5'
		var bgPic = 'https://images.rushouvip.cn/IMG/rsphb.jpg'
		if (currentPic && currentPic != 0) {
			if (currentPic == 1) {
				// bgPic = 'https://images.rushouvip.cn/IMG/rsphb2.png'
				bgPic = 'https://images.rushouvip.cn/IMG/rsphb3.jpg'
			} else {
				bgPic = 'https://images.rushouvip.cn/IMG/rsphb3.jpg'
			}
		}
		var imgArr = []
		downImgPic(erweima).then(function (res) {
			imgArr.push(res.path)
			downImgPic(bgPic).then(function (ress) {
				imgArr.push(ress.path)
				drawping(imgArr, that)
			}).catch(function (e) {
				console.log(e)
				app.promsg('图片获取失败')
				wx.hideLoading
			})
		}).catch(function (e) {
			console.log(e)
			app.promsg('二维码获取失败')
			wx.hideLoading
		})
	}
}
function drawping(imgArr, that) {
	const ctxs = wx.createCanvasContext('canvasCircle1')
	ctxs.drawImage(imgArr[1], 0, 0, 375, 667)
	circleImg(ctxs, imgArr[0], 138, 530, 50)
	ctxs.draw(false, function (e) {
		wx.canvasToTempFilePath({
			x: 0,
			y: 0,
			width: 375,
			height: 650,
			destWidth: 1125,
			destHeight: 1950,
			quality: 1,
			canvasId: 'canvasCircle1',
			success: function (ret) {
				wx.hideLoading()
				that.setData({
					haibao: ret.tempFilePath
				})
			}
		})
	})
}
//拼团图画画
function drawpingtuan(that, proimg, sharptye){
  let proname, gbprice, productprice
  if (sharptye==1){
    proname = that.data.msgdata.proname
    gbprice = that.data.msgdata.gbprice
    productprice = that.data.msgdata.productprice
  } else if (sharptye == 2){
    proname = that.data.msgdata.proname
    gbprice = that.data.msgdata.gbprice
    productprice = that.data.msgdata.productprice
  } else if (sharptye == 3) {
		proname = that.data.groupBuyList.sharetitle
		// gbprice = that.data.msg.openspec ? that.data.groupBuyList.gbprice || that.data.gbsku[0].gbskuPrice
		gbprice = that.data.groupBuyList.gbprice
		// productprice = that.data.msg.openspec ? that.data.msgd.saleprice || that.data.sku[0].saleprice
		productprice = that.data.msgd.saleprice
	}
  console.log(2)
  const ctxs = wx.createCanvasContext('canvasCircle1')
  //获取图片完成 开始画画
  ctxs.drawImage('/image/pingtuanback.png', 0, 0, 375, 650)
  //头像
  circleImg(ctxs, proimg[0], 158, 46, 35)
  //文字
  ctxs.setFontSize(16)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#FF5541')
  ctxs.fillText("“遇见好物想和你一起分享”", 191, 150)
  //商品文字
  ctxs.setFontSize(20)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#333333')
  textline(proname, ctxs, 191, 190,30,300)
  //商品图片
  ctxs.drawImage(proimg[1], 155, 240,80, 80)
  //拼团价
  ctxs.drawImage('/image/pintuan@3x.png', 160, 335, 58, 18)
  //价格
  ctxs.setFontSize(20)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#FF5541')
  ctxs.fillText("¥" + gbprice, 150, 385)
  ctxs.setFontSize(16)
  ctxs.setTextAlign('left')
  ctxs.setFillStyle('#999999')
  var gbpricewidth = ctxs.measureText(gbprice).width
  ctxs.fillText("¥" + productprice, 150 + Number(gbpricewidth), 385)
  //原价删除线
  var productpriceWidth = ctxs.measureText("¥" + productprice).width
  ctxs.setFillStyle('#999999')
  ctxs.beginPath()
  ctxs.moveTo(150 + Number(gbpricewidth), 380)
  ctxs.lineTo(150 + Number(gbpricewidth) + Number(productpriceWidth), 380)
  ctxs.stroke()
  //二维码
  ctxs.drawImage(proimg[2], 155, 400, 80, 80)
  //结束语
  ctxs.setFontSize(16)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#999999')
  ctxs.fillText("长按识别小程序码一起拼团吧", 191, 510)
  //最后绘画
  ctxs.draw(false, function (e) {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 375,
      height: 650,
      destWidth: 1125,
      destHeight: 1950,
      quality: 1,
      canvasId: 'canvasCircle1',
      success: function (ret) {
        wx.hideLoading()
        that.setData({
          haibao: ret.tempFilePath
        })
      }
    })
  })
}
// 新拼团海报
function newPT(that, proimg, sharptye) {
	let proname, gbprice, productprice
	if (sharptye == 3) {
		proname = that.data.groupBuyList.sharetitle
		// gbprice = that.data.msg.openspec ? that.data.groupBuyList.gbprice || that.data.gbsku[0].gbskuPrice
		gbprice = that.data.groupBuyList.gbprice
		// productprice = that.data.msg.openspec ? that.data.msg.saleprice || that.data.sku[0].saleprice
		productprice = that.data.msg.saleprice
	}
	console.log(2)
	const ctxs = wx.createCanvasContext('canvasCircle1')
	//获取图片完成 开始画画
	ctxs.drawImage(proimg[3], 0, 0, 375, 650)
	//头像
	circleImg(ctxs, proimg[0], 90, 135, 28)
	//二维码
	circleImg(ctxs, proimg[2], 142, 510, 45)
	//文字
	ctxs.setFontSize(12)
	ctxs.setTextAlign('center')
	ctxs.setFillStyle('#333')
	ctxs.fillText("给你安利一个好东西~", 214, 155)
	ctxs.setFontSize(12)
	ctxs.setTextAlign('center')
	ctxs.setFillStyle('#333')
	ctxs.fillText("一起拼团更便宜", 198, 175)
	//商品文字
	ctxs.setFontSize(14)
	ctxs.setTextAlign('center')
	ctxs.setFillStyle('#333333')
	textline(proname, ctxs, 191, 392, 30, 200)
	//商品图片
	ctxs.drawImage(proimg[1], 115, 225, 145, 145)
	//拼团价
	ctxs.drawImage('/image/pingtuanjia.png', 190, 432, 58, 18)
	//价格
	ctxs.setFontSize(22)
	ctxs.setTextAlign('center')
	ctxs.setFillStyle('#FE334B')
	var gbpricewidth = ctxs.measureText(gbprice).width
	ctxs.fillText('￥' + gbprice, 150, 450)
	ctxs.setFontSize(12)
	ctxs.setTextAlign('center')
	ctxs.setFillStyle('#999999')
	ctxs.fillText("¥" + Number(productprice).toFixed(2) + '/日常价', 180, 470)
	//原价删除线
	var productpriceWidth = ctxs.measureText("¥" + Number(productprice).toFixed(2) + '/日常价').width
	productpriceWidth = Number(productpriceWidth) / 2
	ctxs.setFillStyle('#999999')
	ctxs.beginPath()
	ctxs.moveTo(180 - productpriceWidth, 465)
	ctxs.lineTo(180 + productpriceWidth, 465)
	ctxs.stroke()
	//最后绘画
	ctxs.draw(false, function (e) {
		wx.canvasToTempFilePath({
			x: 0,
			y: 0,
			width: 375,
			height: 650,
			destWidth: 1125,
			destHeight: 1950,
			quality: 1,
			canvasId: 'canvasCircle1',
			success: function (ret) {
				wx.hideLoading()
				that.setData({
					haibao: ret.tempFilePath
				})
			}
		})
	})
}
// 夺宝海报制作
function drawduobao(that, imgArr, sharptye) {
  // console.log(that.data.msg)
  let proname, cloudPrice, proprice
  if (sharptye == 3) {
    proname = that.data.msg.proname
    cloudPrice = that.data.msg.cloudPrice
    proprice = that.data.msg.proprice
  }
  const ctxs = wx.createCanvasContext('canvasCircle1')
  //获取图片完成 开始画画
  ctxs.drawImage('/image/duobaoback.jpg', 0, 0, 375, 650)
  //头像
  circleImg(ctxs, imgArr[0], 155, 46, 35)
  //文字
  ctxs.setFontSize(16)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#FF5541')
  ctxs.fillText("“万一就运气爆棚了呢”", 191, 150)
  //商品文字
  ctxs.setFontSize(20)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#333333')
  textline(proname, ctxs, 188, 190, 30, 280)
  //商品图片
  ctxs.drawImage(imgArr[1], 150, 240, 80, 80)
  //夺宝价
  ctxs.drawImage('/image/duobaojia_icon@3x.png', 160, 335, 58, 18)
  //价格
  ctxs.setFontSize(20)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#FF5541')
  ctxs.fillText("¥" + cloudPrice, 150, 385)
  ctxs.setFontSize(16)
  ctxs.setTextAlign('left')
  ctxs.setFillStyle('#999999')
  var cldpricewidth = ctxs.measureText(cloudPrice).width
  ctxs.fillText("¥" + proprice, 170 + Number(cldpricewidth), 385)
  //原价删除线
  var propriceWidth = ctxs.measureText("¥" + proprice).width
  ctxs.setFillStyle('#999999')
  ctxs.beginPath()
  ctxs.moveTo(170 + Number(cldpricewidth), 380)
  ctxs.lineTo(170 + Number(cldpricewidth) + Number(propriceWidth), 380)
  ctxs.stroke()
  //二维码
  // ctxs.drawImage(imgArr[2], 150, 400, 80, 80)
  circleImg(ctxs, imgArr[2], 151, 420, 38)
  //结束语
  ctxs.setFontSize(14)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#999999')
  ctxs.fillText("长按识别小程序码", 191, 520)
  // 结束语第二段
  ctxs.setFontSize(14)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#999999')
  ctxs.fillText("一起参加夺宝吧", 191, 540)
  //最后绘画
  ctxs.draw(false, function (e) {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 375,
      height: 650,
      destWidth: 1125,
      destHeight: 1950,
      quality: 1,
      canvasId: 'canvasCircle1',
      success: function (ret) {
        wx.hideLoading()
        that.setData({
          haibao: ret.tempFilePath
        })
      }
    })
  })
}

//保存海报
function savehaibao(that) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            //授权完成
            wx.saveImageToPhotosAlbum({
              filePath: that.data.haibao,
              success(res) {
                app.promsg('保存成功')
              }
            })
          }
        })
      } else {
        wx.saveImageToPhotosAlbum({
          filePath: that.data.haibao,
          success(res) {
            app.promsg('保存成功')
          }
        })
      }
    }
  })
}




module.exports = {
  noscoll: noscoll,
  closeshare: closeshare,
  sharequan: sharequan,
  savehaibao: savehaibao
}