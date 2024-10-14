export default {
    data () {
      return {
        content: '重新获取',
        totalTime: 120,
        canClick: true //添加canClick
     
      }
    },
    methods: {
        //倒计时
        countDown () {
            //防止连续点击按钮
            if (!this.canClick) return  
            this.canClick = false
            this.content = this.totalTime + 's后重发'
            let clock = window.setInterval(() => {
             this.totalTime--
             this.content = this.totalTime + 's后重发'
             if (this.totalTime < 0) {
              window.clearInterval(clock)
              this.content = '重新发送验证码'
              this.totalTime = 10
              this.canClick = true  //这里重新开启
             }
            },1000)
        }   

    }
  }