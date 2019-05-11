// pages/prolist/prolist.js
const utils = require('../../utils/util.js')
const sharebox = require('../../Component/sharebox/sharebox.js')
const app = getApp()
var fxshop=''
var clsid=''
var sort ='price_asc'
var stop=true
var companyid=''
var bid=''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banimgheight: '',//竖着时图片高度
    qiehuan:true,
    qiehuanimg:'../../image/heng.png',
    status:2,//1是看自己的店有赚多少上架 2是看别人的和没开店的
    skey:'',
    lisdata:[],
    checkstatu:[true,false,false],
    checkimg: ["../../image/upp.png", "../../image/wu.png","../../image/wu.png"],
    shownodata:false,
    showshare: [false, true],//分享控制
    userinfo: '',
    zuan: '',//分享中要传的赚多少
    currpage:1,
    sharpindex: '',//点击打开的商品序号分享用
		searching: false		// 防止连续两次请求，导致NaN
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    console.log(options)
    var that=this
    if (options.title){
      wx.setNavigationBarTitle({
        title: options.title
      })
    }
    if (options.value){
      that.setData({
        skey: options.value
      })
    }
    if (options.clasid){
      clsid = options.clasid
    }
    if (options.bid){
      bid = options.bid
    }
    //竖着时图片高度
    try {
      var res = wx.getSystemInfoSync()
      var height = (res.windowWidth / 2 - 20)
      height = height + 'px'
      that.setData({
        banimgheight: height
      })
    } catch (e) {
      // Do something when catch error
    }
    //判断他看的是自己的还是他人的
    if (wx.getStorageSync('ruid')!=''){
      that.setData({
        status: 2
      })
    } else if (wx.getStorageSync('fxshopid')!=''){
      fxshop = wx.getStorageSync('fxshopid')
      that.setData({
        status: 1
      })
    } else if (wx.getStorageSync('SessionUserID') == '') {
      that.setData({
        status: 2
      })
    }
    that.bindata()
    //店铺信息分享使用
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserShopJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid')
      },
      header: 1,
      successBack: this.usermeng
    })
  },
  trim:function(str){ //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  usermeng:function (ret) {
    var that = this
    var ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        userinfo: ret.Data
      })
    } else {
      app.promsg(ret.err)
    }
  },
  goadd: function (e) {
    var index = e.target.dataset.index
    var pid = e.target.dataset.pid
    var name = e.target.dataset.name
    var pic = e.target.dataset.pic
    var salePrice = e.target.dataset.saleprice
    var marketPrice = e.target.dataset.marketprice
    wx.navigateTo({
      url: '../addpro/addpro?pid=' + pid + '&name=' + name + '&pic=' + pic + '&salePrice=' + salePrice + '&marketPrice=' + marketPrice + '&index='+index
    })
  },
  //弹出分享框
  goshare: function (e) {
    wx.hideTabBar()
    var that = this
    console.log(e)
    var index = e.currentTarget.dataset.index
    that.data.sharpindex = index
    this.setData({
      showshare: [true, true],
      zuan: that.data.lisdata[index].commPrice.toFixed(2)
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
      wx.showTabBar()
    }
  },
  //分享到朋友圈生成图片
  sharequan: function (that) {
    var that = this
    sharebox.sharequan(that, 2, 3)
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
    bindata:function(){
      var that=this
      var askey=''
      if (that.data.skey!=""){
        askey = that.trim(that.data.skey)
      }
      utils.http({
        url: app.globalData.siteUrl + '/Main/Main/GetProductListJson',
        data: {
          currpage: that.data.currpage,
          pageSize: 8,
          clsid: clsid,
          sort: sort,
          act: 'search',
          skey: askey,
          userid: wx.getStorageSync('SessionUserID'),
          fxshopid: fxshop,
          companyid: companyid,
          bid: bid
        },
        successBack: that.lisdata
      })
    },
    qiehuan:function(){
      var a = !this.data.qiehuan
      var img
      if(a){
        img ='../../image/heng.png'
      }else{
        img = '../../image/shu.png'
      }
      this.setData({
        qiehuan: a,
        qiehuanimg:img
      })
    },
    lisdata:function(ret){
			console.log(ret)
			this.setData({
				searching: false
			})
      var that=this
    	ret=ret.data
			if (ret.status == 1 && ret.success && ret.gbobj.length>0){
				if (that.data.currpage == 1) {
					that.setData({
						lisdata: [],
						shownodata:false
					})
					stop = true
				}
				that.setData({
					lisdata: that.data.lisdata.concat(ret.gbobj),
				})
			} else if (ret.success && ret.gbobj.length==0){
				if (that.data.currpage == 1) {
					that.setData({
						lisdata: [],
						shownodata: true
					})
				}
				stop=false
			}else{
				app.promsg(ret.err)
			}
      that.data.currpage++
    },
    //排序
    paixu:function(e){
      var that=this
      console.log(e)
      var imgse = that.data.checkimg
      var checkse = that.data.checkstatu
      var index = e.currentTarget.dataset.index
      //选中已经选中的
      if (that.data.checkstatu[index]){
        if(index==0){
          if (sort == 'price_asc') {
            sort = 'price_desc'      
            imgse[index] ='../../image/down.png'     
          } else if (sort == 'price_desc') {
            sort = 'price_asc'
            imgse[index] = '../../image/upp.png'     
          }
        }else if(index==1){
          if (sort == 'collect_asc') {
            sort = 'collect_desc'
            imgse[index] = '../../image/down.png'     
          } else if (sort == 'collect_desc') {
            sort = 'collect_asc'
            imgse[index] = '../../image/upp.png'     
          }
        }else if(index==2){
          if (sort == 'sale_asc') {
            sort = 'sale_desc'
            imgse[index] = '../../image/down.png'     
          } else if (sort == 'sale_desc') {
            sort = 'sale_asc'
            imgse[index] = '../../image/upp.png'     
          } 
        }
      }else{
        if (index == 0) {
          checkse=[true,false,false]
          sort = 'price_asc'      
          imgse=["../../image/upp.png", "../../image/wu.png", "../../image/wu.png"]
        }else if(index==1){
          checkse = [false, true, false]
          sort = 'collect_asc'
          imgse = ["../../image/wu.png", "../../image/upp.png", "../../image/wu.png"]
        }else if(index==2){
          checkse = [false, false, true]
          sort = 'sale_asc'
          imgse = ["../../image/wu.png", "../../image/wu.png", "../../image/upp.png"]
        }
      }
      that.setData({
        checkimg: imgse,
        checkstatu: checkse
      })
      console.log(sort)
      that.data.currpage = 1
      stop = true
      that.bindata()
    },
    //搜索
    serch:function(e){
			if (this.data.searching) return
			this.setData({
				searching: true
			})
      var that = this
      that.setData({
        skey: e.detail.value
      })
      that.data.currpage = 1
      stop = true
      that.bindata()
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
    console.log('页面卸载避免page外的数据没有重置')
    fxshop = ''
    clsid = ''
    sort = 'price_asc'
    stop = true
    companyid = ''
    bid = ''
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log(1111)
    this.data.currpage=1
    this.bindata()
    stop=true
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that=this
    if (stop){
      that.bindata()
    } 
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this
    var ruid
    if (wx.getStorageSync('ruid') != '') {
      ruid = wx.getStorageSync('ruid')
    } else {
      ruid = wx.getStorageSync('SessionUserID')
    }
    return {
      title: that.data.lisdata[that.data.sharpindex].name,
      path: 'pages/productdetail/productdetail?pid=' + that.data.lisdata[that.data.sharpindex].pid + '&ruid=' + ruid,
      imageUrl: that.data.lisdata[that.data.sharpindex].pic
    }
  },
  //上架成功改变数据
  addsuccess: function (index) {
    var that = this
    console.log(index)
    var a = "lisdata[" + index + "].isup"
    that.setData({
      [a]: 1
    })
  }
})