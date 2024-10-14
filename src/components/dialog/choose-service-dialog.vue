// 选择项目弹窗
<template>
  <div>
    <Modal title="选择项目" v-model="modal"
      @on-cancel="cancel" 
      class="w-dialog choose-dialog"
      width="90%"
      :mask-closable="false">
      <div class="choose-content">
        <ul class="parent-class">
          <li class="choose-header">项目类别</li>
          <choose-class
            @choose-class="chooseClass"
            :category="category">
          </choose-class>
          <li class="choose-footer">
            <router-link to="/store/service/category"><i class="iconfont icon-leibieguanli"></i>类别管理</router-link>
          </li>
        </ul>
        <div class="choose-table service-table">
          <div style="min-height: 500px; padding-bottom: 74px;">
            <p class="choose-header">项目库
              <Input v-model="formData.serviceName" placeholder="输入项目名称" style="width: 292px" />
              <i @click.stop="search" class="iconfont icon-sousuo"></i>
            </p>
            <div class="library">
              <Table stripe class="w-table"
                ref="table" 
                :columns="columns" 
                :data="tableData"
                @on-select-all="allSelection"
                @on-select="toSelect"
                @on-select-cancel="cancelSelect"
                @on-selection-change="selectionChange"
                @on-row-click="rowChange">
              </Table>
              <Spin fix v-if="loading"></Spin>
            </div>
          </div>
          <div class="choose-bottom">
            <!-- <w-pagination 
              :showSizer="true"
              :total="tableTotal"
              @change="pageChange">
            </w-pagination> -->
            
            <div style="display: flex; flex-grow: 1; justify-content: flex-end; margin-top: 20px;">
              <saas-page
                ref="page"
                v-show="tableTotal > rows"
                :sizer="true"
                :page="page"
                :rows="rows"
                :total="tableTotal"
                @on-change="pageChange">
              </saas-page>
            </div>
            <Button v-if="permiss.create" type="text" @click="toAdd">
              <i class="iconfont icon-xinzeng"></i>新增项目
            </Button>
          </div>
        </div>
        <div class="confirm-table service-confirm">
          <div style="min-height: 500px; padding-bottom: 51px;">
            <p class="choose-header">已选项目</p>
            <div class="scoll">
              <Table stripe class="w-table" :columns="confirmColumns" :data="selectList"></Table>
            </div>
          </div>
          <div class="choose-bottom">
            <Button type="text" @click="deleteAll">
              <i class="iconfont icon-shanchu"></i>清空已选项目
            </Button>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click.native.stop="cancel">取消</Button>
        <Button type="error" size="large" 
          @click.native.stop="submit">确定</Button>
      </div>
    </Modal>
    <add-service ref="addService"
      @add-success="newService"></add-service>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import addService from '@/components/dialog/add-service-dialog';
import chooseClass from '@/components/choose-class';
import { pricingMode, getObj } from '@/store/json/default';
import '@/styles/components/table.less';
import '@/styles/components/dialog.less';

export default {
  data () {
    let { settingService } = this.$permission.data;
    return {
      permiss: settingService,
      modal: false,
      cancelRow: false,
      page: 1,
      rows: 10,
      formData: {
        serviceName: '',
        code: ''
      },
      columns: [
        { type: 'selection', width: 40, className: 'selection' },
        { 
          title: '项目名称', 
          key: 'serviceName', 
          minWidth: 150, 
          className: 'name' 
        },
        { 
          title: '类别', 
          key: 'cateStr',
          render: (h, { row }) => {
            return h('div', row.cateStr && row.cateStr.split('/').pop())
          }  
        },
        { 
          title: '定价方式', 
          key: 'pricingType',
          render: (h, { row }) => {
            return h('div', getObj(pricingMode)[row.pricingType]);
          } 
        },
        { 
          title: '工时费', 
          key: 'price',
          render: (h, { row }) => {
            return h('div', row.price || '--');
          } 
        },
        { 
          title: '工时', 
          key: 'hours',
          render: (h, { row }) => {
            return h('div', row.hours || '--');
          } 
        },
        { 
          title: '项目总价', 
          key: 'cost',
          render: (h, { row }) => {
            return h('div', row.cost || row.price * row.hours);
          }  
        }
      ],
      confirmColumns: [
        { 
          title: '项目名称', 
          key: 'serviceName',
          minWidth: 100, 
          className: 'first-row' 
        },
        { 
          title: '项目总价', 
          key: 'cost',
          render: (h, { row }) => {
            return h('div', row.cost && Number(row.cost).toFixed(2));
          }
        },
        { 
          title: ' ', 
          width: 40,
          className: 'opt',
          render: (h, { row }) => {
            return h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.selectList.forEach((item, index) => {
                    if (item.serviceId === row.serviceId) {
                      this.selectList.splice(index, 1);
                      this.init();
                    }
                  })
                }
              }
            }, '删除')
          }
        }
      ]
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetServiceCateList'
    });
  },

  computed: {
    ...mapGetters({
      tableTotal: 'getTableDataTotal',
      tableData: 'getTableData',
      category: 'getServiceCateList',
      selectList: 'getSelectService'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    tableData (val) {
      if (val) {
        for (let i = 0; i < this.tableData.length; i++) {
          for (let j = 0; j < this.selectList.length; j++) {
            if (this.tableData[i].serviceId == this.selectList[j].serviceId) {
              this.$nextTick(function () {
                this.$refs.table.toggleSelect(i);
              })
            }
          }
        }
      }
    }
  },

  methods: {
    // 单个选择
    toSelect (selection, row) {
      this.cancelRow = false;
      let temp = row;
      let isEixt = false;

      for (let i = 0; i < this.selectList.length; i++) {
        if (this.selectList[i].serviceId == temp.serviceId) {
          isEixt = true;
        }
      }

      if (!isEixt) this.selectList.push(temp);
      
      this.$store.dispatch({
        type: 'toSelectService',
        cur: this.selectList
      });
    },

    // 取消单个选择
    cancelSelect (selection, row) {
      this.cancelRow = true;
      this.selectList.forEach((item, index) => {
        if (row.serviceId === item.serviceId) this.selectList.splice(index, 1);
      })

      this.$store.dispatch({
        type: 'toSelectService',
        cur: this.selectList
      });
    },

    // 全选
    allSelection (selection) {
      this.cancelRow = false;
      const multiple = this.selectList;
      multiple.forEach((item, index) => {
        selection.forEach((vv, kk) => {
          if (item.serviceId === vv.serviceId) {
            vv.isEixt = true;
          }
        })
      })

      selection.forEach((item, index) => {
        if (!item.isEixt) {
          this.selectList.push(item);
        }
      })

      this.$store.dispatch({
        type: 'toSelectService',
        cur: this.selectList
      });
    },

    selectionChange (selection) {
      // 全不选
      if (selection.length === 0 && !this.cancelRow) {
        const multiple = this.selectList;
        const final = [];
        multiple.forEach((item, index) => {
          this.tableData.forEach((vv, kk) => {
            if (item.serviceId === vv.serviceId) {
              item.isEixt = true;
            }
          })
        })

        multiple.forEach((item, index) => {
          if (!item.isEixt) {
            final.push(item);
          }
        })

        this.selectList.splice(0, this.selectList.length);
        final.forEach((item, index) => {
          this.selectList.push(item);
        })

        this.$store.dispatch({
          type: 'toSelectService',
          cur: this.selectList
        });
      }
    },

    rowChange (row, index) {
      let isEixt = false;
      if (!this.$refs.table.objData[index]._isChecked) {
        this.cancelRow = false;
        for (let i = 0; i < this.selectList.length; i++) {
          if (this.selectList[i].serviceId == row.serviceId) {
            isEixt = true;
          }
        }

        if (!isEixt) this.selectList.push(row);
      } else {
        this.cancelRow = true;
        this.selectList.forEach((item, index) => {
          if (row.serviceId === item.serviceId) this.selectList.splice(index, 1);
        })
      }

      this.$refs.table.objData[index]._isChecked = !this.$refs.table.objData[index]._isChecked;

      this.$store.dispatch({
        type: 'toSelectService',
        cur: this.selectList
      });
    },

    deleteAll () {
      this.$store.dispatch('clearService');
      this.init();
    },

    init () {
      const obj = {
        page: this.page,
        rows: this.rows
      }

      const form = Object.assign({}, this.formData, obj);

      const payload = {
        request: 'serviceList',
        params: form
      }

      this.$store.dispatch({
        type: 'toGetTableData',
        payload
      })
    },

    search () {
      this.page = 1;
      this.init();
    },

    pageChange (value) {
      this.page = value.page;
      this.rows = value.rows;
      this.init();
    },

    openModal (list) {
      this.formData.serviceName = '';
      this.$store.dispatch({
        type: 'toSelectService',
        cur: list
      });

      this.modal = true;
      this.init();
    },

    cancel () {
      this.modal = false;
      this.$emit('on-cancel');
    },

    chooseClass (code) {
      this.formData.code = code;
      this.page = 1;
      this.init();
    },

    submit () {
      this.modal = false;
      this.$emit('choose-success', this.selectList);
    },

    toAdd () {
      this.$refs.addService.openModal();
    },

    newService (data, isCheck) {
      if (isCheck) {
        this.selectList.push(data);
        this.$store.dispatch({
          type: 'toSelectService',
          cur: this.selectList
        });
      }
      this.init();
    }
  },

  components: { addService, chooseClass }
}
</script>
