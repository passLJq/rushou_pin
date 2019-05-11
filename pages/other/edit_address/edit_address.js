// pages/address-add/address-add.js
var app = getApp()
const util = require('../../../utils/util.js')
const disjson = require('../../../utils/distirctjson.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    province: [],
    city: [],
    area: [],
    multiArray: [[], [], []],
    multiIndex: [18, 0, 0],
    checkcity:false//是否选择过地址
  },
  addressid: "",//编辑进来的地址ID
  addressList: "",//编辑地址数据
  adressid: '',
  distirctcode: '',
  initDistirct: function () {
    var that = this
    disjson.districtjson.forEach(function (item, index) {
      that.data.province.push(item.ftitle)
    })
    disjson.districtjson[18].fjunior.forEach(function (item, index) {
      that.data.city.push(item.ftitle)
    })
    disjson.districtjson[18].fjunior[0].fjunior.forEach(function (item, index) {
      that.data.area.push(item.ftitle)
    })
    var multiArray = [that.data.province, that.data.city, that.data.area]
    that.distirctcode = "440101"
    that.setData({
      multiArray: multiArray
    })
  },
  bindMultiPickerChange: function (e) {
    var sel = e.detail.value
    console.log(sel)
    var code = ''
    if (sel[0] != -1 && sel[1] != -1 && sel[2] != -1) {
      code = disjson.districtjson[sel[0]].fjunior[sel[1]].fjunior[sel[2]].fid
    } else if (sel[0] != -1 && sel[1] != -1) {
      code = disjson.districtjson[sel[0]].fjunior[sel[1]].fid
    } else if (sel[0] != -1) {
      code = disjson.districtjson[sel[0]].fid
    }
    this.setData({
      checkcity: true,
      showcity: this.data.multiArray[0][this.data.multiIndex[0]],
      showshi: this.data.multiArray[1][this.data.multiIndex[1]],
      showqu: this.data.multiArray[2][this.data.multiIndex[2]]
    })
    this.distirctcode = code
  },
  bindMultiPickerColumnChange: function (e) {
    var data = {
      province: this.data.province,
      city: this.data.city,
      area: [],
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    if (data.multiIndex[e.detail.column] != -1) {
      data.multiIndex[e.detail.column] = e.detail.value;
      switch (e.detail.column) {
        case 0:
          data.city = [];
          if (disjson.districtjson[e.detail.value].fjunior.length > 0) {
            disjson.districtjson[e.detail.value].fjunior.forEach(function (item, index) {
              data.city.push(item.ftitle)
            })
            if (disjson.districtjson[e.detail.value].fjunior[0].fjunior.length > 0) {
              disjson.districtjson[e.detail.value].fjunior[0].fjunior.forEach(function (item, index) {
                data.area.push(item.ftitle)
              })
              data.multiIndex[2] = 0;
            } else {
              data.multiIndex[2] = -1;
            }
            data.multiIndex[1] = 0;
          } else {
            data.multiIndex[1] = -1;
            data.multiIndex[2] = -1;
          }
          data.multiArray = [data.province, data.city, data.area]
          break;
        case 1:
          if (disjson.districtjson[data.multiIndex[0]].fjunior[e.detail.value].fjunior.length > 0) {
            disjson.districtjson[data.multiIndex[0]].fjunior[e.detail.value].fjunior.forEach(function (item, index) {
              data.area.push(item.ftitle)
            })
            data.multiIndex[2] = 0;
          } else {
            data.multiIndex[2] = -1;
          }
          data.multiArray = [data.province, data.city, data.area]
          break;
      }
    }
    this.setData(data);
  },
  back: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  delAdress: function () {
    var that = this
    wx.showModal({
      title: '友情提示',
      content: '确认要删掉这个地址吗？',
      success: function (res) {
        if (res.confirm) {
          util.http({
            url: app.globalData.siteUrl + '/Main/Member/DeleteAddress?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
            method: "POST",
            data: {
              addressid: that.data.addressid
            },
            header: 1,
            successBack(ret) {
              if(ret && ret.data.status == 1) {
                app.showtips("删除成功")
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 1000)
              }
            }
          })
        } else {

        }

      }
    })
  },
  bindAdress: function (flag) {
    let that = this
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetOneAddress?devicetype=5',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        addressid: this.data.addressid
      },
      header: 1,
      successBack: (ret)=>{
        if (ret && ret.data.status == 1) {
          var data = ret.data.Data
          this.addressList = data
          this.setData({
            consignee: data.name,
            phonecode: data.phone,
            fulladress: data.address
          })
          that.distirctcode = data.areacode
          var multiIndex = [-1, -1, -1]
          outer:
          for (var index = 0; index < disjson.districtjson.length; index++) {
            multiIndex[0] = index;
            var item = disjson.districtjson[index]
            if (data.areacode == item.fid) {
              break outer;
            }
            for (var jindex = 0; jindex < item.fjunior.length; jindex++) {
              multiIndex[1] = jindex;
              var jitem = item.fjunior[jindex]
              if (data.areacode == jitem.fid) {
                break outer;
              }
              for (var tindex = 0; tindex < jitem.fjunior.length; tindex++) {
                multiIndex[2] = tindex;
                var titem = jitem.fjunior[tindex]
                if (data.areacode == titem.fid) {
                  break outer;
                }
              }
            }
          }
          that.bindMultiPickerColumnChange({ detail: { column: 0, value: multiIndex[0] } })
          that.bindMultiPickerColumnChange({ detail: { column: 1, value: multiIndex[1] } })
          that.setData({ 
            multiIndex: multiIndex,
            checkcity: true,
            showcity: this.data.multiArray[0][multiIndex[0]],
            showshi: this.data.multiArray[1][multiIndex[1]],
            showqu: this.data.multiArray[2][multiIndex[2]]
            })
        }
      }
    })

  },
  changedefault: function (e) {
    this.setData({ isdefault: !this.data.isdefault })
  },
  saveAdress: function (e) {
    var that = this
    if (!that.data.consignee) { app.alerts("收货人的姓名不能为空", { showCancel: true }); return;}
    if (!that.data.phonecode) { app.alerts("请输入手机号", { showCancel: true }); return; }
    if (!that.data.checkcity) { app.alerts("请选择地区", { showCancel: true }); return; }
    let telReg = /^[1][3,4,5,7,8][0-9]{9}$/
    if (!telReg.test(that.data.phonecode)) {
      app.alerts("请输入正确的手机号码", { showCancel: true})
      return
    }
    if (!that.distirctcode) { app.alerts("请选择地区", { showCancel: true }); return; }
    if (!that.data.fulladress) { app.alerts("详细地址不能为空", { showCancel: true }); return; }

    util.http({
      url: app.globalData.siteUrl + '/Main/Member/InsertorUpdateAddress?devicetype=5&uid=' + wx.getStorageSync("SessionUserID"),
      method: "POST",
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        name: that.data.consignee,
        areacode: that.distirctcode,
        address: that.data.fulladress,
        phone: that.data.phonecode,
        addressID: this.data.addressid
      },
      header: 1,
      successBack(ret) {
        if(ret && ret.data.status == 1) {
          app.showtips("保存成功")
          setTimeout(()=> {
            wx.navigateBack({
              delta: 1
            })
          },1000)
        }
        
      }
    })
  },
  bindconsignee: function (e) {
    this.setData({
      consignee: e.detail.value
    })
  },
  bindphone: function (e) {
    this.setData({
      phonecode: e.detail.value
    })
  },
  bindfulladress: function (e) {
    this.setData({
      fulladress: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initDistirct()
    console.log(options)
    if (options.addressid) {
      this.setData({
        addressid: options.addressid
      })
      this.bindAdress(true)
    }
    
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