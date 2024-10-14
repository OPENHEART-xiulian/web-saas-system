<template>
  <i-select v-model="warehouseId" @on-change="onChange" :disabled="disabled">
    <i-option v-for="(item, index) in list" :key="index" :value="item.warehouseId">{{item.warehouseName}}</i-option>
  </i-select>
</template>

<script>
  export default {
    props: {
      defaultList: Array,
      index: Number,
      data: Object, // 配件数据
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
        list: [], // 仓库列表
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
        let ele = {};
        if (this.list.length === 0) {
          this.disabled = true;
        } else {
          this.list.forEach(element => {
            if (element.isDefault === '1') {
              this.warehouseId = element.warehouseId;
              ele = JSON.parse(JSON.stringify(element));
            }
          });
        }

        let wareItem = {};
        // 编辑的时候是有仓库id的
        if (this.data.warehouseId) {
          for (let i = 0; i < this.list.length; i++) {
            const item = this.list[i];
            if (item.warehouseId === this.data.warehouseId) {
              wareItem = JSON.parse(JSON.stringify(item));
            }
          }
        } else {
          wareItem = ele;
        }
        
        wareItem.warehouseId = this.data.warehouseId || wareItem.warehouseId;
        wareItem.warehouseName = this.data.warehouseName || wareItem.warehouseName;
        wareItem.shelfId = this.data.shelfId || ((wareItem.shelves && wareItem.shelves.length !== 0) ? wareItem.shelves[0].shelfId : '');
        wareItem.shelfName = this.data.shelfName || ((wareItem.shelves && wareItem.shelves.length !== 0) ? wareItem.shelves[0].shelfName : '');
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
