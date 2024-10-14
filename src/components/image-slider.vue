<!-- 显示大图 -->
<template>
  <transition name="fade">
    <div class="image-slider-bg model-cover" v-if="show">
      <div class="carousel-con">
        <Carousel ref="carousel" v-model="carouseValue" arrow="never" :easing="easing" dots="none">
          <CarouselItem v-for="(item, index) in list" :key="index">
            <div class="image-item">
              <img :src="getUri('checkImg') + item">
            </div>
          </CarouselItem>
        </Carousel>
        <span v-show="carouseValue !== 0" class="focus-btn left-btn" @click.stop="prev">
          <Icon type="chevron-left"></Icon>
        </span>
        <span v-show="carouseValue !== list.length-1" class="focus-btn right-btn" @click.stop="next">
          <Icon type="chevron-right"></Icon>
        </span>
        <span class="close-btn" @click.stop="closeImg">
          <i class="iconfont icon-quxiao"></i>
        </span>
      </div>
    </div>
  </transition>
</template>
<script>
import { getUri } from '@/https/api.js';
import '@/styles/components/image-slider.less';
export default {
  data () {
    return {
      getUri,
      carouseValue: 0,
      easing: "none",
      list: [],
      show: false
    };
  },
  methods: {
    closeImg () {
      this.show = false;
      this.easing = "none";
    },
    prev () {
      if (this.carouseValue === 0) return;
      this.$refs.carousel.arrowEvent(-1);
    },
    next () {
      if (this.carouseValue === this.list.length - 1) return;
      this.$refs.carousel.arrowEvent(1);
    },
    showImg (list, index) {
      if (!this.show) this.show = true;
      setTimeout(() => {
        this.easing = "ease";
      }, 100);
      this.list = list;
      this.carouseValue = index;
    }
  }
};
</script>
