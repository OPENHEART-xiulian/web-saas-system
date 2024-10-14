// 选择会员卡弹窗
<template>
  <div>
    <Modal title="选择会员卡" v-model="modal"
      @on-cancel="cancel" 
      class="w-dialog choose-dialog choose-card-dialog"
      width="60%"
      :mask-closable="false">
      <div class="choose-content">
        <ul class="parent-class">
          <li class="choose-header">会员卡类别</li>
          <li v-for="item in cardCate" 
            :key="item.value"
            :class="['cate-li', { 'active-li': item.value === formData.type }]"
            @click="chooseCate(item.value)">
            {{ item.name }}
          </li>
        </ul>
        <div class="choose-table card-table">
          <div style="min-height: 500px; padding-bottom: 74px;">
            <p class="choose-header">会员卡
              <Input v-model="formData.name" placeholder="输入会员卡名称快速搜索" style="width: 292px" />
              <i @click.stop="search" class="iconfont icon-sousuo"></i>
            </p>
            <div class="library">
              <Table stripe class="w-table"
                ref="table" 
                :columns="columns" 
                :data="tableData"
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
            
            <div style="display: flex; flex-grow: 1; justify-content: flex-end; padding-top: 20px;">
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
            <Button v-if="marketCardTemplate.create" type="text" @click="toAdd">
              <i class="iconfont icon-xinzeng"></i>新建会员卡模板
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
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { memberCardType, getObj } from '@/store/json/default';
import '@/styles/components/table.less';
import '@/styles/components/dialog.less';

export default {
  data () {
    let { marketCardTemplate } = this.$permission.data;
    return {
      marketCardTemplate,
      modal: false,
      page: 1,
      rows: 10,
      formData: {
        name: '',
        type: '' // 当前选择会员卡类型
      },
      curSelect: {}, // 当前选中的会员卡
      cardCate: [
        { name: '全部会员卡', value: '' },
        { name: '服务卡', value: '0' },
        { name: '充值卡', value: '1' }
      ],
      currentid: '', // 当前选择的表格项
      columns: [
        {
          title: ' ',
          width: 40,
          render: (h, params) => {
            let self = this;
            return h('div', [
              h('Radio', {
                props: {
                  value: params.row.radio
                },
                on: {
                  'on-change': (e) => {
                    self.tableData.forEach((item) => {      // 先取消所有对象的勾选，radio设置为false
                      self.$set(item, 'radio', false);
                    });
                    this.tableData[params.index].radio = e;
                  }
                }
              })
            ])
          }
        },
        { title: '名称', key: 'name', minWidth: 100 },
        { 
          title: '类型', 
          key: 'type',
          render: (h, { row }) => {
            return h('div', getObj(memberCardType)[row.type]);
          } 
        },
        { title: '有效期', key: 'expiry' },
        { 
          title: '卡片余量', 
          render: (h, { row }) => {
            return h('div', row.cardRemainCount);
          }
        },
        { title: '售价', key: 'salePrice' },
        { title: '销售量', key: 'cardSaleCount', width: 90 }
      ],
    }
  },

  computed: {
    ...mapGetters({
      tableTotal: 'getTableDataTotal',
      tableData: 'getTableData'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    tableData (val) {
      if (val) {
        val.forEach(item => {
          if (item._id === this.curSelect._id) {
            item.radio = true;
          }
        })
      }
    }
  },

  methods: {
    chooseCate (value) { // 选择类型
      this.formData.type = value;
      this.init();
    },

    rowChange (row, index) {
      this.tableData.forEach((item) => {      // 先取消所有对象的勾选，radio设置为false
        this.$set(item, 'radio', false);
      });
      this.tableData[index].radio = true;
      this.curSelect = row;
    },

    init () {
      const obj = {
        forOrder: true,
        page: this.page,
        rows: this.rows
      }

      const form = Object.assign({}, this.formData, obj);

      const payload = {
        request: 'memberCardList',
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

    openModel (item) {
      this.curSelect = item;
      this.formData.name = '';
      this.modal = true;

      this.init();
    },

    cancel () {
      this.modal = false;
      this.$emit('on-cancel');
    },

    submit () {
      this.modal = false;
      let chooseItem = {};
      this.tableData.forEach(item => {
        if (item.radio) chooseItem = item;
      })
      this.$emit('choose-success', chooseItem);
    },

    toAdd () {
      this.$router.push('/market/template/form/create');
    }
  },
}
</script>
