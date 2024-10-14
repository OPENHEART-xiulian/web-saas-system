<template>
  <div v-if="modal" 
    :class="['carousel-dialog', {'narrow-carousel': isNarrow}]"
    @click="enlarge">
    <div class="carousel-content">
      <!-- <div :class="['carousel-item', {'carousel-left': animate && index === 1}]" v-for="(item, index) in lists" :key="index">
        <img :src="item.src"/>
      </div> -->
      <div class="carousel-item">
        <img :src="curImg" />
      </div>
      <div class="end-carousel" v-if="isEnd">
        <i class="iconfont icon-wancheng-fill"></i>
        <p>播放完毕</p>
        <Button type="primary" @click="reset">重新播放</Button>
        <Button type="primary" @click="toCourse">全部视频</Button>
      </div>
    </div>
    <div class="dialog-footer" v-show="!isNarrow">
      <div style="float: left;">
        <Button type="default" 
          @click.stop="toSuspend"
          :disabled="isEnd">{{isAutoplay ? '暂停播放' : '自动播放'}}
        </Button>
        <Button type="default" 
          @click.stop="next(0)" 
          :disabled="noPrevious || isEnd">上一步
        </Button>
        <Button type="default" 
          @click.stop="next(1)" 
          :disabled="isEnd">下一步
        </Button>
      </div>
      <div style="float: right;">
        <Button type="default" @click.stop="narrow">缩小</Button>
        <Button type="default" @click.stop="closeModal">关闭</Button>
      </div>
    </div>
  </div>
</template>

<script>
import '@/styles/components/dialog.less';

export default {
  data () {
    return {
      carousel: null,
      animate: false,
      modal: false,
      isAutoplay: false, // 是否自动切换
      isNarrow: false, // 是否缩小
      isEnd: false, // 是否播放完毕
      noPrevious: true, // 是否不能上一步，默认不能
      lists: [],
      healthLists: [ // 健康档案账号管理
        { src: require('../../assets/images/course/health/01.jpg') },
        { src: require('../../assets/images/course/health/02.jpg') },
        { src: require('../../assets/images/course/health/03.jpg') },
        { src: require('../../assets/images/course/health/04.jpg') },
        { src: require('../../assets/images/course/health/05.jpg') }
      ],
      workLists: [
        { src: require('../../assets/images/course/work/01.jpg') },
        { src: require('../../assets/images/course/work/02.jpg') },
        { src: require('../../assets/images/course/work/03.jpg') },
        { src: require('../../assets/images/course/work/04.jpg') },
        { src: require('../../assets/images/course/work/05.jpg') },
        { src: require('../../assets/images/course/work/06.jpg') },
        { src: require('../../assets/images/course/work/07.jpg') },
        { src: require('../../assets/images/course/work/08.jpg') },
        { src: require('../../assets/images/course/work/09.jpg') },
      ],
      serverLists: [
        { src: require('../../assets/images/course/server/01.jpg') },
        { src: require('../../assets/images/course/server/02.jpg') },
        { src: require('../../assets/images/course/server/03.jpg') },
        { src: require('../../assets/images/course/server/04.jpg') },
        { src: require('../../assets/images/course/server/05.jpg') },
        { src: require('../../assets/images/course/server/06.jpg') },
        { src: require('../../assets/images/course/server/07.jpg') }
      ],
      maintainLists: [
        { src: require('../../assets/images/course/maintain/01.jpg') },
        { src: require('../../assets/images/course/maintain/02.jpg') },
        { src: require('../../assets/images/course/maintain/03.jpg') },
        { src: require('../../assets/images/course/maintain/04.jpg') },
        { src: require('../../assets/images/course/maintain/05.jpg') },
        { src: require('../../assets/images/course/maintain/06.jpg') },
        { src: require('../../assets/images/course/maintain/07.jpg') }
      ],
      curImg: '',
      index: 0
    }
  },

  methods: {
    showMarquee () { // 轮播循环
      this.animate = true;
      // setTimeout(() => {
      //   // this.lists.push(this.lists[0]);
      //   // this.lists.shift();
      //   if (this.index >= this.lists.length) {
      //     this.curImg = this.lists[0];
      //     this.
      //   } else {
      //     this.index++;
      //     this.curImg = this.lists[this.index].src;
      //   }
      //   this.animate = false;
      // }, 5000);
      if (this.index >= this.lists.length - 1) {
        this.curImg = this.lists[0].src;
        this.isEnd = true;
        clearInterval(this.carousel);
        this.isAutoplay = false;
      } else {
        this.index++;
        this.curImg = this.lists[this.index].src;
        this.noPrevious = false;
      }
    },

    openModal (key) {
      switch (key) {
        case 'health':
          this.lists = this.healthLists;
          break;
        case 'work':
          this.lists = this.workLists;
          break;
        case 'server':
          this.lists = this.serverLists;
          break;
        case 'maintain':
          this.lists = this.maintainLists;
          break;
        default:
          break;
      }
      this.init();
      this.modal = true;
    },

    init () {
      this.index = 0;
      this.isEnd = false;
      this.noPrevious = true;
      this.isAutoplay = false;
      this.curImg = this.lists[0].src;
    },

    toSuspend () { // 暂停/开始自动切换 ，5000ms
      this.isAutoplay = !this.isAutoplay;
      if (this.isAutoplay) {
        this.carousel = setInterval(this.showMarquee, 5000);
      } else {
        this.animate = false;
        clearInterval(this.carousel);
      }
    },

    next (value) {
      clearInterval(this.carousel);
      if (value) { // 下一步
        if (this.index >= this.lists.length - 1) {
          this.curImg = this.lists[0].src;
          this.isEnd = true;
        } else {
          this.index++;
          this.curImg = this.lists[this.index].src;
          this.noPrevious = false;
        }
      } else { // 上一步
        if (this.index > 0) {
          this.index--;
          this.curImg = this.lists[this.index].src;
          if (this.index === 0) this.noPrevious = true; // 不能上一步了
        } else {
          
        }
      }
      if (this.isAutoplay) this.carousel = setInterval(this.showMarquee, 5000);
      // clearInterval(this.carousel);
      // if (value) { // 下一步
      //   this.lists.push(this.lists[0]);
      //   this.lists.shift();
      // } else { // 上一步
      //   this.lists.unshift(this.lists[this.lists.length - 1]);
      //   this.lists.pop();
      // }
      // if (this.isAutoplay) this.carousel = setInterval(this.showMarquee, 5000);
    },

    reset () { // 重新播放
      this.init();
    },

    toCourse () {
      this.modal = false;
      this.$parent.openCourse();
    },

    narrow () { // 缩小
      this.isNarrow = true;
    },

    enlarge () {
      this.isNarrow = false; // 放大
    },

    closeModal () {
      this.modal = false;
      this.$parent.$refs.page.showOpt = true;
      clearInterval(this.carousel);
    }
  }
}
</script>
