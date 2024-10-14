<template>
  <i-select v-model="warehouseId" @on-change="onChange" :disabled="disabled">
    <i-option v-for="(item, index) in list" :key="index" :value="item.warehouseId || ''">{{item.warehouseName}}</i-option>
  </i-select>
</template>

<script>
  export default {
    props: {
      defaultList: Array,
      index: Number,
      data: Object,
      request: String,
      autoInit: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        warehouseId: '',
        disabled: false,
        list: []
      }
    },
    mounted () {
      if (this.autoInit) {
        this.init();
      } else {
        this.list = JSON.parse(JSON.stringify(this.defaultList));
        this.setDefault();
      }
    },

    methods: {
      async init () {
        try {
          const params = {};
          if (this.data) {
            params.componentId = this.data.componentId;
          }
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'wateflowItem',
            params: params
          });

          if (res.code === '0') {
            this.list = res.data.rows;
            this.setDefault();
          }
        } catch (error) {
          
        }
      },

      setDefault () {
        let ele = null;
        // 没有仓库的时候不需要处理，正常是有仓库的
        if (this.list.length === 0) {
          this.disabled = true;
          return
        }
        
        ele = JSON.parse(JSON.stringify(this.list[0]));

        let wareItem = {};
        // 编辑
        if (this.data.warehouseId) {
          for (let i = 0; i < this.list.length; i++) {
            const item = this.list[i];
            if (item.warehouseId === this.data.warehouseId) {
              wareItem = JSON.parse(JSON.stringify(item));
              wareItem.warehouseId = this.data.warehouseId;
              wareItem.warehouseName = this.data.warehouseName;
            }
          }
        } else {
          wareItem = ele;
        }
        
        this.warehouseId = wareItem.warehouseId;
        this.$emit('default-change', wareItem, this.index);
      },

      onChange (v) {
        for (let i = 0; i < this.list.length; i++) {
          const item = this.list[i];
          if (item.warehouseId === v) {
            item.shelves = item.shelves || [];
            this.$emit('on-change', JSON.parse(JSON.stringify(item)), this.index);
          }
        }
      }
    }
  }
</script>
