<template>
  <div class="vehicle-list">
    <div class="title">
      <span>车辆信息</span>
      <i-button type="primary" @click="openModal" v-if="list.length">新增车辆</i-button>
    </div>
    <div class="table-wrap">
      <i-table v-if="list.length" class="vehicle-table" :data="list" :columns="columns"></i-table>
      <div class="no-data" v-else>
        <p>暂无车辆信息</p>
        <div>
          <i-button type="primary" @click="openModal">新增车辆</i-button>
        </div>
      </div>
    </div>
    <add-brand ref="addBrand" @on-confirm="onConfirm" :required="true"></add-brand>
  </div>
</template>

<script>
  import AddBrand from './add-dialog';
  import { vehicleType, getLabel } from '@/store/json/default';
  import { DateAdd } from '@/assets/js/utils';
  export default {
    components: { AddBrand },
    props: {
      data: {
        type: Array,
        required: true
      }
    },
    data () {
      return {
        columns: [
          { type: 'index', title: '序号', width: 80, align: 'center' },
          { 
            title: '车牌号码', 
            key: 'plateNo', 
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => h('span', row[column.key] || '--') 
          },  
          { 
            title: '车型', 
            key: 'vehicleBrand', 
            minWidth: 240,
            ellipsis: true,
            render: (h, { row, column }) => {
              let text = row[column.key];
              if (row['carSeries']) text += ' / ' + row['carSeries'];
              if (row['carStyle']) text += ' / ' + row['carStyle'];
              return h('span', text || '--');
            }
          }, 
          { 
            title: '车架号/VIN号', 
            key: 'VINCode', 
            minWidth: 160,
            ellipsis: true,
            render: (h, { row, column }) => h('span', row[column.key] || '--') 
          },
          { 
            title: '年检到期时间', 
            key: 'registDate', 
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => h('span', DateAdd('year', 1, row[column.key]) || '--') 
          }, 
          { 
            title: '保险到期时间', 
            key: 'compulsoryInsuranceExpireDate', 
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => h('span', row[column.key] || '--') 
          }, 
          // { 
          //   title: '发动机号', 
          //   key: 'engineNo', 
          //   minWidth: 100,
          //   ellipsis: true,
          //   render: (h, { row, column }) => h('span', row[column.key] || '--') 
          // }, 
          // { 
          //   title: '车辆类型', 
          //   key: 'vehicleType', 
          //   minWidth: 100,
          //   ellipsis: true,
          //   render: (h, { row, column }) => {
          //     return h('span', getLabel(row[column.key], vehicleType) || '--') 
          //   }
          // }, 
          {
            title: '操作',
            width: 120,
            render: (h, { row, index }) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      console.log(row)
                      this.onEdit({
                        index: index,
                        vehicle: row
                      });
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'text'
                  },
                  on: {
                    click: () => {
                      this.onDelete(row, index);
                    }
                  }
                }, '删除'),
              ]);
            }
          }
        ],
        list: []
      }
    },

    watch: {
      data (to) {
        this.list = to;
      },
    },

    methods: {
      openModal () {
        this.$refs.addBrand.openModal({
          customerType: this.$parent.formData.customerType,
        });
      },
      onEdit (obj) {
        obj.customerType = this.customerType;
        this.$refs.addBrand.openModal(obj);
      },

      onDelete (data, index) {
        this.list.splice(index, 1);
      },
      
      onConfirm (obj) {
        if (!obj.index && obj.index !== 0) {
          this.list.push(obj.vehicle);
        } else {
          this.list.splice(obj.index, 1, obj.vehicle);
        }
      },

      saveData () {

      },

      getFormRows () {
        return this.list.slice(0);
      }
    }
  }
</script>

<style lang="less">
  .vehicle-list {
    margin-top: 20px;
    background: white;
    .title {
      padding: 0 20px;
      border-radius: 3px;
      background-color: #fcfbfa;
      text-align: left;
      font-weight: bold;
      height: 50px;
      line-height: 50px;
      font-size: 14px;
      color: #332E29;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .table-wrap {
      padding: 20px;
    }
    .vehicle-table {
      width: 100%;
      border: none;

      .ivu-table-cell {
        font-size: 14px!important;
      }

      .ivu-table::before, .ivu-table::after {
        background-color: transparent;
      }
    }

    .no-data {
      padding: 40px;
      text-align: center;
      p {
        margin-bottom: 10px;
      }
    }
  }
</style>
