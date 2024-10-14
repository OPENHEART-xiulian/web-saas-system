<template>
  <div class="search-input">
    <i-input ref="input" 
      v-model="inputText" 
      :placeholder="placeholder"
       @on-change="onChange" 
       @on-focus="focus" 
       @on-blur="blur" 
       @on-keyup.enter="keyupEnter">
      <slot name="append" slot="append"></slot>
    </i-input>
    <ul 
      v-if="state !== 1 && showSelect && (options.plateNos.length !== 0 || options.mobiles !== 0)" 
      class="search-list" 
      @mouseenter="enter" 
      @mouseleave="leave">
      <p class="title" v-if="options.plateNos.length !== 0">车牌号</p>
      <li 
        v-if="options.plateNos.length !== 0" 
        v-for="item in options.plateNos" 
        @click="optionClick(item, 'plateNo', item.parent)" 
        :key="item.customerId">
        {{item.plateNo}}
      </li>
      <p class="title" v-if="options.mobiles.length !== 0">联系电话</p>
      <li 
        v-if="options.mobiles.length !== 0" 
        v-for="item in options.mobiles" 
        @click="optionClick(item, 'mobile')" 
        :key="item.customerId">
        {{item.mobile}}
      </li>
    </ul>
    <ul 
      v-if="state === 1 && showSelect && dataRows.length !== 0" 
      class="search-list" 
      @mouseenter="enter" 
      @mouseleave="leave" 
      style="width: 100%">
      <li 
        style="padding-left: 10px"
        v-for="(item, index) in dataRows" 
        @click="optionClick(item, modelKey)" 
        :key="index">
        {{item[modelKey]}}
      </li>
    </ul>
  </div>
</template>

<script>
import '@/styles/components/search-input.less';
import { mapGetters, mapState } from 'vuex';
export default {
  props: {
    state: {  // 是否是普通下拉列表
      type: Number,
      default: 0
    },
    action: {
      type: String,
      default: 'toGetInventoryList'
    },
    dataName: {
      type: String,
      default: 'getInventoryList'
    },
    canChange: {
      type: Boolean,
      default: true
    },
    modelKey: String,
    value: String,
    placeholder: String
  },
  data () {
    return {
      inputText: '',
      hoverList: false,   // 用于判断鼠标是否进入select范围，input失焦不关闭select 
      showSelect: false,  // 是否显示select框
      options: {
        plateNos: [],
        mobiles: []
      },
      dataRows: []
    }
  },
  watch: {
    value (to) {
      this.inputText = to;
    },
    tableData (to) {
      if (this.state !== 1) {
        let plateNos = [];
        to.forEach(item => {
          if (item.vehicles) {
            item.vehicles.forEach(element => {
              element.parent = item;
            });
            plateNos = plateNos.concat(item.vehicles);
          }
        });
        this.options = {
          mobiles: to,
          plateNos: plateNos
        }
      } else {
        this.dataRows = to;
      }
      this.$emit('data-change', to);
    }
  },
  mounted () {
    this.inputText = this.value;
  },
  methods: {
    enter () {
      this.hoverList = true;
    },
    leave () {
      this.hoverList = false;
      if (this.showSelect) this.setFocus(); // 如果select未关闭情况鼠标移出，重新获取焦点
    },
    blur () {
      this.$emit('input', this.inputText);
      if (this.hoverList) return;
      this.showSelect = false;
    },
    focus () {
      this.showSelect = true;
      this.$emit('on-focus');
    },
    setFocus () {
      this.$refs.input.focus();
    },
    onChange () {
      this.$emit('input', this.inputText);
      if (!this.canChange) return;
      this.search();
    },

    keyupEnter () {
      this.search();
    },
    search () {
      if (this.state !== 1) this.setFocus();
      if (this.inputText === '') return;
      if (!this.loading) {
        this.$store.dispatch({
          type: this.action,
          params: {
            filter: this.inputText
          }
        })
      }
    },
    optionClick (value, key, parent) {
      this.showSelect = false;
      this.$emit('input', value[key]);
      if (this.state !== 1) {
        if (!parent) {
          parent = value;
          value = parent.vehicles[0];
        }
        this.$emit('on-change', value, parent)
      } else {
        this.$emit('on-change', value)
      };
    }
  },
  computed: {
    tableData () {
      return this.$store.getters[this.dataName];
    },
    // ...mapGetters({ tableData: this.dataName }),
    ...mapState({ loading: state => state.global.isLoading })
  }
}
</script>
