
const app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goapp: {
      type: null,
      value: false,
      observer: function (newVal, oldVal) { }
    }
  },
  pageLifetimes: {
    show() {

    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    msgtitlle: '提现客官请移步至APP喔~'
  },

  /**
   * 组件的方法列表
   */
  methods: {
   saverushou(){
    wx.downloadFile({
      url: 'https://images.rushouvip.cn/IMG/gongzhonghao.jpg', //仅为示例，并非真实的资源
      success: function (rets) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (rets.statusCode === 200) {
          // wx.playVoice({
          //   filePath: res.tempFilePath
          // })
          wx.getSetting({
            success(res) {
              if (!res.authSetting['scope.writePhotosAlbum']) {
                wx.authorize({
                  scope: 'scope.writePhotosAlbum',
                  success() {
                    //授权完成
                    wx.saveImageToPhotosAlbum({
                      filePath: rets.tempFilePath,
                      success(ress) {
                        console.log(ress)
                        app.promsg('保存成功')
                      }
                    })
                  }
                })
              } else {
                wx.saveImageToPhotosAlbum({
                  filePath: rets.tempFilePath,
                  success(ress) {
                    console.log(ress)
                    app.promsg('保存成功')
                  }
                })
              }
            }
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }

    })
  },
    closegoapp(){
      this.triggerEvent("action");
    }
  }
})