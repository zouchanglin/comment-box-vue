<template>
  <div class="container_border page_center">
    <el-form ref="form" :model="commentFormArea" label-width="100px">
      <div style="white-space: nowrap; margin-top: 10px; ">
        <!-- 邮箱 -->
        <img style="height: 40px; width: 40px; border-radius: 20px; vertical-align: middle" :src="clientData.clientIcon" alt=""/>
        <el-tooltip style="margin-top: 4px; margin-bottom: 4px; margin-left: 20px" effect="dark" content="点击可以刷新头像与昵称哦" placement="bottom">
          <el-button style="margin-left: 5px; padding: 10px" size="medium" @click="updateNameIcon()">{{ clientData.clientName }}</el-button>
        </el-tooltip>
        <el-input placeholder="留下Email可以回复提醒哦 ~"
                  prefix-icon="el-icon-position"
                  style="width: 250px; margin-left: 10px; float: right"
                  v-model="clientData.clientEmail"
                  type="email"
                  clearable>
        </el-input>
      </div>
      <div style="white-space: nowrap; margin-top: 10px; ">
        <el-input v-model="commentFormArea.content"  type="textarea" style="width: 100%; border-radius: 6px"
                  :autosize="{ minRows: 2}">
        </el-input>
      </div>
      <!-- 表情输入单元 -->
      <el-popover
        placement="bottom"
        title="表情"
        width="600"
        height="2600"
        trigger="click"
        v-model="emojiShow">
        <el-button slot="reference" style="font-size: 14px; margin-top: 10px;">插入表情 😀</el-button>
        <div class="browBox">
          <ul>
            <li v-for="(item, index) in faceList" :key="index" @click="getBrow(index)">
              {{ item }}
            </li>
          </ul>
        </div>
      </el-popover>
      <div class="my-item my-submit" style="margin-right: 20px">
        <el-row>
          <el-col :span="14">
            <!--allow-half="allow-half"-->
            <el-rate
              v-model="commentFormArea.articleScore"
              show-score
              text-color="#ff9900"
              style="margin-top: 8px; margin-right: 20px; size: 30px"
              score-template="{value}">
            </el-rate>
          </el-col>
          <el-col :span="4">
            <el-button type="success" round @click="submitComment">评论一下 ~</el-button>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <el-row style="margin-top: 20px" :data="queryCommentsData">
      <!-- 文章评论 -->
      <el-col :span="24" v-for="item in queryCommentsData" :key="item.id">
        <div class="grid-content bg-purple" style="background: transparent; border-radius: 10px;">
          <el-divider></el-divider>
          <!-- 具体评论模块 -->
          <el-row>
            <div style="white-space: nowrap; float: left">
              <img style="height: 40px; width: 40px; border-radius: 20px; vertical-align: middle; float: left" :src="item.avatarUrl" alt=""/>
              <div style="float: right; margin-left: 20px">
                <span style="color: black; font-weight: normal">{{ item.clientName }}</span><br>
                <span style="color: #909399; font-size: 14px">{{ item.commentTime }}</span>
              </div>
            </div>
          </el-row>
          <el-row>
            <div style="padding-top: 15px;">
              <span style="font-size: 16px">
              {{ item.commentContent }}
              </span>
            </div>
            <el-button type="primary" icon="iconfont icon-dianzan" @click="praiseForComment(item.id, 0)"
                       style="background: transparent;color: darkslategray; border: 0; padding-left: 10px">&emsp;点赞&emsp;({{ item.commentPraise }})
            </el-button>
            <el-button @click="showDialog(item, item.id)" type="primary" icon="iconfont icon-pinglun"
                       style="background: transparent;color: darkslategray; border: 0;padding:0; margin-left: 0;margin-right: 0">&emsp;回复
            </el-button>
          </el-row>
          <el-row>
            <!-- 子评论模块 -->
            <div style="padding: 8px">
              <el-timeline :reverse="reverse" style="padding-left: 0">
                <el-timeline-item
                  v-for="childItem in item.childComments" :key="childItem.id" :timestamp="childItem.commentTime">
                  {{childItem.clientName}}@ {{childItem.replyClientName}}：{{ childItem.commentContent }}
                  <el-button type="primary" icon="iconfont icon-dianzan"
                             style="background: transparent;color: darkslategray; border: 0; padding:0; margin-left: 0;margin-right: 0" @click="praiseForComment(childItem.id, 1)">&emsp;点赞&emsp;({{ childItem.commentPraise }})
                  </el-button>
                  <el-button @click="showDialog(childItem, item.id)" type="primary" icon="iconfont icon-pinglun"
                             style="background: transparent;color: darkslategray; border: 0; padding:0; margin-left: 20px;margin-right: 0">&emsp;回复
                  </el-button>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-row>
          <!-- 具体评论模块 -->
        </div>
      </el-col>
    </el-row>

    <!-- 添加评论对话框 -->
    <el-dialog
      :title="replyForm.title"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!-- 内容主体 -->
      <el-form ref="reply_form_ref" :model="replyForm" label-width="80px">
        <el-input type="textarea" v-model="replyForm.content" :autosize="{ minRows: 4, maxRows: 6}"></el-input>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="replyComment()">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'Home',
  created () {
    this.loadEmojis()
    this.getCommentsData()
    this.checkUserData()
  },
  methods: {
    // 加载表情，存放到表情列表中
    loadEmojis () {
      const appData = require('@/assets/images/emojis.json')
      for (const i in appData) {
        // eslint-disable-next-line no-prototype-builtins
        if (appData.hasOwnProperty(i)) {
          this.faceList.push(appData[i].char)
        }
      }
    },
    // 获取用户点击之后的标签 ，存放到输入框内
    getBrow (index) {
      this.commentFormArea.content += this.faceList[index]
      this.emojiShow = false
    },
    // 评论点赞
    async praiseForComment(commentId, type){
      // alert(commentId)
      const { data: res } = await this.$http.put('comments', {
        clientId: this.clientData.clientId,
        commentId: commentId,
        type: type,
        articleUrl: this.$route.query.url
      })
      console.log('res = ' + res.data)
      this.queryCommentsData = res.data
    },
    // 提交评论
    async submitComment () {
      const { data: res } = await this.$http.post('comments', {
        email: this.clientData.clientEmail,
        clientId: this.clientData.clientId,
        articleUrl: this.$route.query.url,
        commentContent: this.commentFormArea.content,
        gradeStar: this.commentFormArea.articleScore
      })
      console.log('res = ' + res.data)
      this.queryCommentsData = res.data
      this.commentFormArea.content = '来说点什么吧😀'
    },
    // 回复框关闭
    addDialogClosed () {
      this.replyForm.title = ''
      this.replyForm.replyClientId = ''
      this.replyForm.parentCommentId = ''
      this.replyForm.content = ''
    },
    // 展示回复对话框
    showDialog (item, parentItemId) {
      console.log('parentItemId = ' + parentItemId)
      this.addDialogVisible = true
      this.replyForm.title = '@' + item.clientName + '：'
      this.replyForm.replyClientId = item.clientCode
      this.replyForm.parentCommentId = parentItemId
    },
    // 回复评论
    async replyComment(){
      const { data: res } = await this.$http.post('comments/child', {
        clientId: this.clientData.clientId,
        replyClientId: this.replyForm.replyClientId,
        articleUrl: this.$route.query.url,
        commentContent: this.replyForm.content,
        email: this.clientData.clientEmail,
        parentComment: this.replyForm.parentCommentId
      })
      console.log('res = ' + res.data)
      this.queryCommentsData = res.data
      this.addDialogVisible = false
    },
    // 更新头像与昵称
    async updateNameIcon(){
      const { data: res } = await this.$http.put('client/' + this.clientData.clientId)
      if(res.code !== 200){
        return this.$message.error('更新头像失败!')
      }
      this.clientData = res.data
      this.$message.success({ duration: 1000, message: '更新头像成功!', showClose: true })
      await this.getCommentsData()
    },
    // 获取评论区数据
    async getCommentsData() {
      console.log('this.$route.query.url = ' + this.$route.query.url)
      const { data: res } = await this.$http.get('comments', {
        params: { articleUrl: this.$route.query.url }
      })
      if(res.code !== 200) {
        return this.$message.error({ duration: 0, message: '获取评论列表失败', showClose: true })
      }
      this.queryCommentsData = res.data.articleComments
      console.log(this.queryCommentsData)
    },
    // 判断是否存在用户数据
    async checkUserData() {
      const osInfo = this.getOsInfo() + ' ' + this.getExplorerInfo().type + ' ' + this.getExplorerInfo().version
      console.log('osInfo = ' + osInfo)
      let tmpClientId = window.localStorage.getItem('clientId')
      if(tmpClientId == null || tmpClientId.length === 0){
        const { data: res } = await this.$http.post('client', {
          email: this.clientData.clientEmail,
          clientOs: osInfo
        })
        if(res.code !== 200) this.$message.error({ duration: 0, message: '获取ClientId失败', showClose: true })
        tmpClientId = res.data.clientId
        window.localStorage.setItem('clientId', tmpClientId)
      }
      // 渲染用户信息
      const { data: res } = await this.$http.get('client/' + tmpClientId)
      if(res.code !== 200) {
        this.$message.error({ duration: 0, message: '获取ClientId失败', showClose: true })
      }
      this.clientData = res.data
      console.log('this.clientData = ' + this.clientData)
    },
    // 获取浏览器信息
    getExplorerInfo() {
      let ver
      const explorer = window.navigator.userAgent.toLowerCase()
      if(explorer.indexOf('msie') >= 0) {
        ver = explorer.match(/msie ([\d.]+)/)[1]
        return {
          type: 'IE',
          version: ver
        }
      } else if(explorer.indexOf('firefox') >= 0) {
        ver = explorer.match(/firefox\/([\d.]+)/)[1]
        return {
          type: 'Firefox',
          version: ver
        }
      } else if(explorer.indexOf('chrome') >= 0) {
        ver = explorer.match(/chrome\/([\d.]+)/)[1]
        return {
          type: 'Chrome',
          version: ver
        }
      } else if(explorer.indexOf('opera') >= 0) {
        ver = explorer.match(/opera.([\d.]+)/)[1]
        return {
          type: 'Opera',
          version: ver
        }
      } else if(explorer.indexOf('Safari') >= 0) {
        ver = explorer.match(/version\/([\d.]+)/)[1]
        return {
          type: 'Safari',
          version: ver
        }
      }
    },
    // 获取操作系统信息
    getOsInfo() {
      const userAgent = navigator.userAgent.toLowerCase()
      let name = 'Unknown'
      let version = 'Unknown'
      if(userAgent.indexOf('win') > -1) {
        name = 'Windows'
        if(userAgent.indexOf('windows nt 5.0') > -1) {
          version = 'Windows 2000'
        } else if(userAgent.indexOf('windows nt 5.1') > -1 || userAgent.indexOf('windows nt 5.2') > -1) {
          version = 'Windows XP'
        } else if(userAgent.indexOf('windows nt 6.0') > -1) {
          version = 'Windows Vista'
        } else if(userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
          version = 'Windows 7'
        } else if(userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
          version = 'Windows 8'
        } else if(userAgent.indexOf('windows nt 6.3') > -1) {
          version = 'Windows 8.1'
        } else if(userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows nt 10.0') > -1) {
          version = 'Windows 10'
        } else {
          version = 'Unknown'
        }
      } else if(userAgent.indexOf('iphone') > -1) {
        name = 'Iphone'
      } else if(userAgent.indexOf('mac') > -1) {
        name = 'Mac'
      } else if(userAgent.indexOf('x11') > -1 || userAgent.indexOf('unix') > -1 || userAgent.indexOf('sunname') > -1 || userAgent.indexOf('bsd') > -1) {
        name = 'Unix'
      } else if(userAgent.indexOf('linux') > -1) {
        if(userAgent.indexOf('android') > -1) {
          name = 'Android'
        } else {
          name = 'Linux'
        }
      } else {
        name = 'Unknown'
      }
      return name + ' ' + version
    }
  },
  data () {
    return {
      clientData: {
        clientId: '',
        clientName: '',
        clientIcon: '',
        clientEmail: ''
      },
      // 页面加载时获取评论
      queryCommentsData: [{
        avatarUrl: '',
        childComments: [
          {
            id: 0,
            clientCode: '',
            clientName: '',
            commentContent: '',
            replyClientCode: '',
            replyClientName: '',
            commentTime: '',
            commentPraise: 0
          }
        ],
        clientCode: '',
        clientName: '',
        commentTime: '',
        commentContent: '',
        commentPraise: 0,
        id: 0
      }],
      // 添加评论的对话框是否显示
      addDialogVisible: false,
      // 表情框是否展示
      emojiShow: false,
      // 表情列表
      faceList: [],
      // 表情文本
      getBrowString: '',
      commentFormArea: {
        articleScore: 5,
        content: '来说点什么吧😀'
      },
      // 对话框回复对象
      replyForm: {
        content: '',
        title: '',
        replyClientId: '',
        parentCommentId: ''
      },
      // 评论时间线
      reverse: true
    }
  }
}
</script>

<style lang="less">
.my_detail_item {
  border: 0 solid black;
  border-radius: 10px;
  padding-left: 20px;
  padding-top: 10px;
  padding-right: 20px;
}

.el-input .el-input__inner{
  //background-color: #eaeaea;
}

.el-textarea .el-textarea__inner {
  //background-color: #eaeaea;
  min-height: 100px;
}

.container_border {
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 10px;
  margin-left: 20px;
  margin-right: 20px;
  //border: 2px solid #4398ed;
  border-radius: 10px;
  //box-shadow: 3px 3px 2px #909399;
}

.page_center {
  min-width: 430px;
  //padding: 20px;
  //width: 100%;
  //height: auto;
  //position: absolute;
  //left: 50%;
  //top: 50%;
  //transform: translate(-50%, -50%);
  background-color: #FFFFFF;
}

.my-item {
  padding-left: 10px;
  padding-top: 20px;
  margin-left: 0;
}

.browBox {
  width: 100%;
  height: 200px;
  background: #e6e6e6;
  position: absolute;
  z-index: 100;
  bottom: 0;
  overflow: scroll;

  ul {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;

    li {
      cursor: pointer;
      width: 10%;
      font-size: 26px;
      list-style: none;
      text-align: center;
    }
  }
}

.submit-btn {
  margin: 0 15px 10px 0;
  float: right;
}

.my-submit {
  float: right;
}

.el-dialog {
  .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}

.el-dialog {
  display: flex;
  flex-direction: column;
  margin:0 !important;
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  /*height:600px;*/
  max-height:calc(100% - 200px);
  max-width:calc(100% - 30px);
}
.el-dialog .el-dialog__body {
  flex:1;
  overflow: auto;
}

</style>
