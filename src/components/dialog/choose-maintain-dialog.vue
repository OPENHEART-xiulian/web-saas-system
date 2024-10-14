// 选择配件弹窗
<template>
  <div>
    <Modal title="选择配件" v-model="modal"
      @on-cancel="cancel" 
      class="w-dialog choose-dialog"
      width="90%"
      :mask-closable="false">
      <div class="choose-content">
        <ul class="parent-class">
          <li class="choose-header">配件类别</li>
          <choose-class
            @choose-class="chooseClass"
            :category="category">
          </choose-class>
          <li class="choose-footer">
            <router-link to="/inventory/maintain/category"><i class="iconfont icon-leibieguanli"></i>类别管理</router-link>
          </li>
        </ul>
        <div class="choose-table maintain-table">
          <div style="min-height: 500px; padding-bottom: 104px;">
            <p class="choose-header">配件库
              <Input v-model="formData.filter" placeholder="输入配件名称 / 编号 / 原厂编码" style="width: 292px" />
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
            <Button v-if="inventoryMaintain.create" type="text" @click="toAdd">
              <i class="iconfont icon-xinzeng"></i>新增配件
            </Button>
          </div>
        </div>
        <div class="confirm-table maintain-confirm">
          <div style="min-height: 500px; padding-bottom: 51px;">
            <p class="choose-header">已选配件</p>
            <div class="scoll">
              <Table stripe class="w-table" :columns="confirmColumns" :data="selectList"></Table>
            </div>
          </div>
          <div class="choose-bottom">
            <Button type="text" @click="deleteAll">
              <i class="iconfont icon-shanchu"></i>清空已选配件
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
    <add-maintain ref="addMaintain"
      @add-success="newMaintain">
    </add-maintain>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import addMaintain from '@/components/dialog/add-maintain-dialog';
import chooseClass from '@/components/choose-class';
import '@/styles/components/table.less';
import '@/styles/components/dialog.less';

export default {
  props: {
    request: {
      type: String,
      default: 'componentSearch'
    },
    params: Object
  },
  data () {
    let { inventoryMaintain } = this.$permission.data;
    return {
      inventoryMaintain,
      modal: false,
      cancelRow: false,
      page: 1,
      rows: 10,
      formData: {
        filter: '',
        code: ''
      },
      category: [],
      columns: [
        { type: 'selection', width: 40, className: 'selection' },
        { title: '配件编号', key: 'partNo', className: 'name' },
        { 
          title: '原厂编码', 
          key: 'partFactoryNo', 
          className: 'main-name',
          render: (h, { row }) => {
            return h('div', row.partFactoryNo || '--');
          } 
        },
        { 
          title: '配件名称', 
          key: 'partName',
          minWidth: 50,
          className: 'main-name'
        },
        { 
          title: '分类', 
          key: 'cateStr',
          className: 'main-name',
          render: (h, { row }) => {
            return h('div', row.cateStr && row.cateStr.split('/').pop())
          } 
        },
        { title: '库存', key: 'quantity' },
        { title: '进货价', key: 'purchasePrice' },
        { title: '零售价', key: 'retailPrice' },
      ],
      confirmColumns: [
        { title: '配件编号', key: 'partNo', className: 'first-row' },
        { title: '配件名称', key: 'partName', className: 'name-row' },
        { title: '库存', key: 'quantity' },
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
                    if (item.partNo === row.partNo) {
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
      type: 'repairCateList'
    });
  },

  computed: {
    ...mapGetters({
      tableTotal: 'getTableDataTotal',
      tableData: 'getTableData',
      categoryList: 'getMaintainCateList',
      selectList: 'getSelectMiantian'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    tableData (val) {
      if (val) {
        for (let i = 0; i < this.tableData.length; i++) {
          for (let j = 0; j < this.selectList.length; j++) {
            if (this.tableData[i].partNo == this.selectList[j].partNo) {
              this.$nextTick(function () {
                this.$refs.table.toggleSelect(i);
              })
            }
          }
        }
      }
    },

    categoryList (val) {
      if (val) this.category = val;
    }
  },

  methods: {
    // 单个选择
    toSelect (selection, row) {
      this.cancelRow = false;
      let temp = row;
      let isEixt = false;

      for (let i = 0; i < this.selectList.length; i++) {
        if (this.selectList[i].partNo == temp.partNo) {
          isEixt = true;
        }
      }

      if (!isEixt) this.selectList.push(temp);
      
      this.$store.dispatch({
        type: 'toSelectMiantian',
        cur: this.selectList
      });
    },

    // 取消单个选择
    cancelSelect (selection, row) {
      this.cancelRow = true;
      this.selectList.forEach((item, index) => {
        if (row.partNo === item.partNo) this.selectList.splice(index, 1);
      })

      this.$store.dispatch({
        type: 'toSelectMiantian',
        cur: this.selectList
      });
    },

    // 全选
    allSelection (selection) {
      this.cancelRow = false;
      const multiple = this.selectList;
      multiple.forEach((item, index) => {
        selection.forEach((vv, kk) => {
          if (item.partNo === vv.partNo) {
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
        type: 'toSelectMiantian',
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
            if (item.partNo === vv.partNo) {
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
          type: 'toSelectMiantian',
          cur: this.selectList
        });
      }
    },

    rowChange (row, index) {
      let isEixt = false;
      if (!this.$refs.table.objData[index]._isChecked) {
        this.cancelRow = false;
        for (let i = 0; i < this.selectList.length; i++) {
          if (this.selectList[i].partNo == row.partNo) {
            isEixt = true;
          }
        }

        if (!isEixt) this.selectList.push(row);
      } else {
        this.cancelRow = true;
        this.selectList.forEach((item, index) => {
          if (row.partNo === item.partNo) this.selectList.splice(index, 1);
        })
      }

      this.$refs.table.objData[index]._isChecked = !this.$refs.table.objData[index]._isChecked;

      this.$store.dispatch({
        type: 'toSelectMiantian',
        cur: this.selectList
      });
    },

    deleteAll () {
      this.$store.dispatch('clearRelated');
      this.init();
    },

    init () {
      const obj = {
        page: this.page,
        rows: this.rows
      }

      let form = Object.assign({}, this.formData, obj);
      // form.partNo = form.partName;
      if (this.params) {
        form = Object.assign(form, this.params);
      }
      const payload = {
        request: this.request,
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

    openModel (list) {
      this.formData.filter = '';
      this.$store.dispatch({
        type: 'toSelectMiantian',
        cur: list
      });

      this.modal = true;
      
      // this.$store.dispatch({
      //   type: 'repairCateList'
      // });

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
      this.$refs.addMaintain.openModal();
    },

    newMaintain (data, isCheck) {
      if (isCheck) {
        this.selectList.push(data);
        this.$store.dispatch({
          type: 'toSelectMiantian',
          cur: this.selectList
        });
      }
      this.init();
    }
  },

  components: { addMaintain, chooseClass }
}
</script>
