<template>
  <div>
    <search-form 
      :inputData="inputData" 
      v-show="isShow"
      @form-data="getFormData">
    </search-form>
    
    <div class="header dropdown">
      <span>盘点仓库：</span>
      <Dropdown trigger="click" :transfer="true" style="width: auto">
        <a href="javascript:void(0)">
            {{warehouseName}}
            <Icon type="ios-arrow-down"></Icon>
        </a>
        <DropdownMenu slot="list">
          <DropdownItem v-for="(item, index) in wteflowList" :key="index" @click.native="warehouseChange(item)">{{item.warehouseName}}</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>

    <w-table
      class="table-width takestock-table-add"
      ref="table"
      request="taskstockParts"
      @on-select="onSelect"
      @on-select-cancel="onSelectCancel"
      @on-selection-change="onSelectionChange"
      :auto-init="false"
      :columns="columns_0"
      :tableData="tableData"
      :formData="formData">
    </w-table>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { getUri } from '@/https/api.js';
  import { unit, getObj } from '@/store/json/default.js';
  export default {
    props: {
      selectData: Array,
      isShow: Boolean
    },
    
    data () {
      return {
        formData: {},
        warehouseId: '',
        warehouseName: '',
        wteflowList: [],
        inputData: [
          { type: 'text', key: 'partName', label: '配件名称', holder: '输入配件名称' },
          { type: 'text', key: 'partNo', label: '配件编号', holder: '输入配件编号' },
          { type: 'text', key: 'brand', label: '配件品牌', holder: '输入配件品牌' },
          { 
            key: 'code', 
            label: '配件分类', 
            holder: '请选择配件分类',
            type: 'select', 
            clearable: true,
            data: []
          },
          { type: 'dText', key: ['startQuantity', 'endQuantity'], label: '库存数量' }
        ],
        columns_0: [
          { type: 'selection', width: 65 },
          { title: '序号', type: 'index', width: 65 },
          { 
            title: '图片', 
            key: 'imgIds',
            render: (h, { row }) => {
              return h('my-img', {
                props: {
                  src: row.imgIds && row.imgIds[0] ? getUri('checkImg') + row.imgIds[0] : ''
                },
                style: {
                  width: '40px',
                  height: '40px'
                }
              });
            }
          },
          { title: '配件编号', key: 'partNo' },
          { title: '原厂编码', key: 'partFactoryNo' },
          { title: '配件名称', key: 'partName' },
          { 
            title: '配件品牌', 
            key: 'brand',
            render: (h, { row }) => {
              return h('div', row.brand || '--');
            } 
          },
          { 
            title: '分类', 
            key: 'cateStr',
            render: (h, { row }) => {
              return h('div', row.cateStr && row.cateStr.split('/').pop())
            } 
          },
          { 
            title: '单位', 
            key: 'unit',
            render: (h, { row }) => {
                return h("my-unit", {
                  props: {
                    unit: row.unit
                  }
                });
              }
          },
          { title: '库存', width: 78, key: 'quantity', sortable: 'custom' },
          { title: '进货价', key: 'purchasePrice', sortable: 'custom' },
          { title: '零售价', key: 'retailPrice', sortable: 'custom' },
        ],
      }
    },

    watch: {
      maintainCateList (to) {
        this.inputData[3].data = to.map(elm => {
          return {
            label: elm.name,
            value: elm.code
          }
        })
      },
      tableData (to) {
        this.setSelectData(this.selectData || []);
      }
    },

    mounted () {
      this.getWteflowList();
      this.getCateList();
    },

    methods: {
      resetForm () {
        let data = null;
        this.wteflowList.forEach(item => {
          if (item.isDefault === '1') {
            data = item;
          }
        });
        this.warehouseChange(data || this.wteflowList[0]);
      },
      getFormData (formData) {
        this.formData = formData;
        this.formData.warehouseId = this.warehouseId;
        this.formData.includeEmpty = 1;
        setTimeout(() => {
          this.$refs.table.init();
        }, 100);
      },
      
      async getWteflowList () {
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'wateflowList'
          });

          if (res.code === '0') {
            this.wteflowList = res.data.rows;
            if (this.$route.params.id === 'create') this.resetForm();
          }
        } catch (error) {
        }
      },

      // 设置table已选项
      setSelectData (to) {
        this.tableData.forEach((cItem, index) => {
          for (let i = 0; i < to.length; i++) {
            if (cItem.partNo === to[i].partNo) {
              this.$set(this.tableData[index], '_checked', true)
              return
            } 
          }
          this.$set(this.tableData[index], '_checked', false)
        })
      },

      onSelect (selection, row) {
        this.formatData(selection);
        this.$emit('on-selection-change', selection, false);
      }, 

      onSelectCancel (selection, row) {
        let arr = [row];
        this.formatData(arr);
        this.$emit('on-selection-change', arr, true);
      },
      formatData (data) {
        data.forEach(item => {
          item.incQuantity = Number(item.incQuantity || item.quantity); // 盘点量
          // item.quantity = Number(item.quantity || item.originQuantity) || 0;  // 现有库存
          item.purchasePrice = Number(item.purchasePrice || 0);  // 进货价
          item.retailPrice = Number(item.retailPrice || 0);  // 零售价
        });
      },
      // 处理已选数据
      onSelectionChange (selection) {
        this.formatData(selection);
        if (selection.length === 0) {
          this.$emit('on-selection-change', this.tableData, true);
        }

        if (selection.length === this.tableData.length) {
          this.$emit('on-selection-change', selection, false);
        }
        // console.log(selection)
        // this.formatData(selection);
        // if (selection.length === 0) {
        //   this.$emit('on-selection-change', this.tableData, true);
        //   return;
        // };
        // this.$emit('on-selection-change', selection);
      },
      warehouseChange (data, isInit) {
        if (data.warehouseId === this.warehouseId) return;
        // let data = {};
        // this.wteflowList.forEach(item => {
        //   if (item.warehouseId === value) {
        //     data = JSON.parse(JSON.stringify(item));
        //   }
        // })
        this.formData.warehouseId = data.warehouseId;
        this.warehouseId = data.warehouseId;
        this.warehouseName = data.warehouseName;
        this.formData.includeEmpty = 1;
        this.$refs.table.init();
        if (!isInit) this.$emit('warehouse-change', data);
      },
      getCateList () {
        this.$store.dispatch({
          type: 'repairCateList'
        })
      }
    },
    computed: {
      ...mapGetters({ 
        tableData: 'getTableData',
        maintainCateList: 'getMaintainCateList',
      }),
    }
  }
</script>
