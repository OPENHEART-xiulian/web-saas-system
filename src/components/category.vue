<!-- 分类管理列表筛选组件 -->
<template>
  <div>
    <w-tab :tabList="tabList"
      @tab-change="tabChangeSuccess">
    </w-tab>
    <div class="child-tab" v-if="tabList.length > 0">
      <div class="child second-child" v-if="secondChild.length > 0">
        <span v-for="(item, index) in secondChild" 
          :key="index"
          @click="clickSecondChild(item.id)"
          :class="{'active': item.id === currentSecond}">{{ item.name }}
        </span>
      </div>
      <div class="child third-child" v-if="currentSecond && thirdChild.length > 0">
        <span v-for="(item, index) in thirdChild" 
          @click="clickThirdChild(item.id)"
          :key="index"
          :class="{'active': item.id === currentThird}">{{ item.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import '@/styles/components/category.less';

export default {
  props: {
    category: Array,
    name: {
      type: String,
      default: '项目'
    }
  },

  data () {
    return {
      tabList: [],
      secondChild: [],
      thirdChild: [],
      currentSecond: '',
      currentThird: '',
    }
  },

  computed: {
    ...mapGetters({
      groupData: 'getTableGroupData',
    })
  },

  watch: {
    groupData (value) {
      if (value) {
        this.tabList.forEach((item, index) => {
          for (let i in value) {
            if (i === item.key || (item.key === "other" && i == "")) {
              item.value = value[i];
            }
          }
        })
      }
    },

    category (value) {
      if (value) {
        const arr = [{name: '全部' + this.name, value: 0, key: 'all'}];
        value.forEach(item => {
          arr.push({
            name: item.name,
            value: 0,
            key: item.code
          })
        });

        // arr.push({name: "其他", value: '0', key: ''});
        this.tabList = arr;
        this.getCate(value);
      }
    }
  },

  methods: {
    getCate (value, key, childKey) {
      const cArr = [];
      const tArr = [];
      value.forEach((item, index) => {
        if (item.children) {
          item.children.forEach((citem, cindex) => {
            if (key - 1 === index) {
              cArr.push({
                name: citem.name,
                code: citem.code,
                id: citem.cid
              });
            }
            
            if (citem.children) {
              citem.children.forEach(titem => {
                if (!key || key - 1 === index) {
                  if (!childKey || childKey === citem.cid) {
                    tArr.push({
                      name: titem.name,
                      code: titem.code,
                      id: titem.cid
                    })
                  }
                }
              })
            }
          })
        }
      })
      this.secondChild = cArr;
      this.thirdChild = tArr;
    },

    tabChangeSuccess (value, data) {
      let code = '';
      this.current = value;
      this.currentSecond = '';
      this.currentThird = '';
      this.getCate(this.category, value); 
      
      this.category.forEach((item, index) => {
        if (value - 1 === index) {
          code = item.code;
        }
      });

      this.$emit('tab-change', code, data.key);
    },

    clickSecondChild (value) {
      let code = '';
      this.currentSecond = value;
      this.currentThird = '';
      this.getCate(this.category, this.current, value);

      this.secondChild.forEach(item => {
        if (item.id === value) code = item.code;
      });

      this.$emit('tab-change', code);
    },

    clickThirdChild (value) {
      let code = '';
      this.currentThird = value;
      this.thirdChild.forEach(item => {
        if (item.id === value) code = item.code;
      })

      this.$emit('tab-change', code);
    }
  },
}
</script>
