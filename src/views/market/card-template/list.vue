<template>
  <div class="card-template">
    <saas-bread title="会员卡模板">
      <template slot="actions">
        <Button v-if="permissionData.create" type="error" @click="toAddTemplate">新增会员卡模板</Button>
        <Button v-if="marketCardService.create" type="error" @click="toSale">出售会员卡</Button>
      </template>
    </saas-bread>
    <w-table
      class="card-template-table"
      ref="table"
      request="memberCardList"
      :columns="columns"
      :tableData="tableData">
    </w-table>
    <remind-dialog 
      v-if="permissionData.delete"
      ref="remindDialog"
      title="作废模板"
      content="确定要作废该会员卡模板吗"
      @on-ok="delConfirm">
    </remind-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import remindDialog from '@/components/dialog/remind-dialog';
import {getUri} from '@/https/api.js';

export default {
  data () {
    let permissionData = this.$permission.data.marketCardTemplate;
    let marketCardService = this.$permission.data.marketCardService;
    let n = 0;
    permissionData.check && n++;
    permissionData.update && n++;
    permissionData.delete && n++;
    let width = 150;
    if (n <= 1) width = 70;
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { title: '名称', key: 'name' },
      { 
        title: '封面', 
        key: 'coverId',
        width: 80,
        render: (h, { row }) => {
          if (row.bgColor) { // 颜色背景
            return h('div', {
              style: { width: '60px', height: '40px', background: row.bgColor }
            })
          } else {
            return h('my-img', {
              props: {
                src: row.coverId ? getUri('checkImg') + row.coverId : ''
              },
              style: { width: '60px', height: '40px' }
            });
          }
        }
      },
      { 
        title: '类型', 
        key: 'type',
        render: (h, { row }) => {
          return h('div', row.type === '0' ? '服务卡' : '充值卡');
        } 
      },
      { title: '有效期', key: 'expiry' },
      { title: '卡片余量', key: 'cardRemainCount' },
      { title: '售价', key: 'salePrice' },
      { title: '销售量', key: 'cardSaleCount' },
      { title: '创建日期', key: 'createdAt', width: 170 },
      { 
        title: '状态', 
        key: 'status',
        render: (h, { row }) => {
          return h('div', row.status === '0' ? '停用' : '正常');
        } 
      },
      { 
        title: '操作',
        width,
        render: (h, { row }) => {
          // row.status === '0' 已作废
          let elms = [];
          if (permissionData.check) {
            elms.push(h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.$router.push('/market/template/detail/' + row._id);
                }
              }
            }, '查看'));
          }

          if (row.status !== '0') {
            if (row.cardSaleCount == '0' && permissionData.update) {
              if (elms.length) elms.push(h('span', ' | '));
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    this.$router.push('/market/template/form/' + row._id);
                  }
                }
              }, '修改'));
            }
            
            if (permissionData.delete) {
              if (elms.length) elms.push(h('span', ' | '));
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    this.$refs.remindDialog.openModal();
                    this.currentId = row._id;
                  }
                }
              }, '作废'));
            }
          }
          return elms;
        }
      }
    ];
    if (n == 0) columns.pop();
    return {
      marketCardService,
      permissionData,
      currentId: '',
      columns
    }
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  methods: {
    delConfirm () { // 作废模板请求
      this.$store.dispatch({
        type: 'actionPost',
        params: {
          _id: this.currentId
        },
        name: 'memberCardCancel'
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('作废成功');
          this.$refs.remindDialog.onCancel();
          this.$refs.table.init();
        }
      }).catch((err) => {
        this.$store.commit('REQUEST_ERROR', { err });
      })
    },

    toAddTemplate () {
      this.$router.push('/market/template/form/create');
    },

    toSale () {
      this.$router.push('/market/card/form/create');
    }
  },

  components: { remindDialog }
}
</script>
