<!-- 选择项目、配件弹窗的类别组件 -->
<template>
  <div class="class-scoll">
    <li class="first-list"
      :class="{'active': curParent === ''}"
      @click.stop="chooseClass('all')">全部类别</li>
    <li v-for="item in category" 
      :key="item.code"
      @click.stop="chooseClass('parent', item.code)"
      :class="{'active': item.code === curParent}">
      <span>{{ item.name }}</span>
      <Icon :type="item.show ? 'chevron-up' : 'chevron-down'"
        v-if="item.children.length > 0">
      </Icon>
      <ul v-show="item.show">
        <li v-for="citem in item.children"
          :key="citem.code"
          @click.stop="chooseClass('child', citem.code)"
          :class="{'cactive': citem.code === curSecond}">
          <span>{{ citem.name }}</span>
          <Icon :type="citem.show ? 'chevron-up' : 'chevron-down'"
            v-if="citem.children.length > 0">
          </Icon>
          <ul v-show="citem.show">
            <li v-for="titem in citem.children"
              @click.stop="chooseClass('tchild', titem.code)"
              :key="titem.code"
              :class="['last-child', {'tactive': titem.code === curThird}]">
              <span>{{ titem.name }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </div>
</template>

<script>
import '@/styles/components/choose-class.less';

export default {
  props: {
    category: Array
  },

  data () {
    return {
      curParent: '',
      curSecond: '',
      curThird: '',
    }
  },

  methods: {
    chooseClass (type, code) {
      let Index = '';
      let Cindex = '';
      let Tindex = '';
      this.category.forEach((item, index) => {
        if (item.code === code) {
          Index = index;
        }
        if (item.children) {
          item.children.forEach((citem, cindex) => {
            if (citem.code === code) {
              Index = index;
              Cindex = cindex;
            }

            if (citem.children) {
              citem.children.forEach((titem, tindex) => {
                if (titem.code === code) {
                  Index = index;
                  Cindex = cindex;
                  Tindex = tindex;
                }
              })
            }
          })
        }
      })
      
      switch (type) { // 兼容新旧分类code返回啊啊啊啊
        case 'parent':
          if (code.indexOf('#') != -1) {
            if ('#' + code.split('#')[1] !== this.curParent) this.curSecond = '';
            if ('#' + this.curThird.split('#')[1] + '#' + this.curThird.split('#')[2] !== this.curSecond) this.curThird = '';
          } else {
            if (code.split('')[0] !== this.curParent) this.curSecond = '';
            if (this.curThird.split('')[0] + this.curThird.split('')[1] !== this.curSecond) this.curThird = '';
          }

          this.curParent = code;
          this.category[Index].show = !this.category[Index].show;
          this.$set(this.category, Index, this.category[Index]);
          break;
        case 'child':
          if (code.indexOf('#') != -1) {
            if ('#' + code.split('#')[1] + '#' + code.split('#')[2] !== this.curSecond) this.curThird = '';
            this.curSecond = code; 
            this.curParent = '#' + code.split('#')[1];
          } else {
            if (code.split('')[0] + code.split('')[1] !== this.curSecond) this.curThird = '';
            this.curSecond = code; 
            this.curParent = code.split('')[0];
          }
         
          this.category[Index].children[Cindex].show = !this.category[Index].children[Cindex].show;
          this.$set(this.category, Index, this.category[Index]);
          break;
        case 'tchild':
          if (code.indexOf('#') != -1) {
            this.curParent = '#' + code.split('#')[1];
            this.curSecond = '#' + code.split('#')[1] + '#' + code.split('#')[2];
          } else {
            this.curParent = code.split('')[0];
            this.curSecond = code.split('')[0] + code.split('')[1];
          }
          
          this.curThird = code;
          this.category[Index].children[Cindex].children[Tindex].show = !this.category[Index].children[Cindex].children[Tindex].show;
          this.$set(this.category, Index, this.category[Index]);
          break;
        case 'all':
          this.curParent = '';
          this.curSecond = '';
          this.curThird = '';
          break;
        default:
          break;
      }

      let formCode = '';
      if (this.curThird) {
        formCode = this.curThird;
      } else if (this.curSecond) {
        formCode = this.curSecond;
      } else {
        formCode = this.curParent;
      }

      this.$emit('choose-class', formCode);
    }
  }
}
</script>
