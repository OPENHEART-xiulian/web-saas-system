<template>
  <div class="deposit-list">
    <saas-bread title="挂账应收">
      <!-- <div class="f-right">
        <Button type="default" @click="showForm">{{ isShow ? '收起' :  '展开' }}筛选
          <Icon :type="isShow ? 'arrow-up-b' : 'arrow-down-b'"></Icon>
        </Button>
      </div> -->
    </saas-bread>
    <!-- <search-form 
      v-show="isShow" 
      :inputData="inputData"
      @form-data="getFormData">
    </search-form> -->
    
    <div class="search-wrap">
      <i-input class="search-input" v-model="formData.filter" placeholder="输入客户名称/手机号/车牌号搜索客户">
        <span class="prepend" slot="prepend"><i class="iconfont icon-sousuo"></i></span>
        <span class="append" slot="append" @click="getFormData">搜索</span>
      </i-input>
    </div>
    <w-table
      ref="table"
      request="onCreditList"
      :columns="columns"
      :tableData="tableData"
      :formData="formData"
      :params="params">
    </w-table>
    <remind-dialog 
      ref="remindDialog"
      :title="title"
      :show-cancel="showCancel"
      :isHtml="true"
      :content="content"
      @on-ok="remindOk">
    </remind-dialog>
    <print ref="print"></print>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import remindDialog from '@/components/dialog/remind-dialog';
import print from "./print";

export default {
  components: { print, remindDialog },
  data () {
    let width = 180;
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { 
        title: '姓名', 
        key: 'customerName',
        render: (h, { row }) => {
          return h('div', row.customerId ? row.customerName : "匿名客户");
        }  
      },
      { 
        title: '联系方式', 
        key: 'mobile',
        render: (h, { row }) => {
          return h('div', row.mobile || '无联系方式');
        }  
      },
      {
        title: "挂账单数",
        key: "count"
      },
      { 
        title: '挂账金额', 
        key: 'leftReceivable',
        render: (h, { row }) => {
          return h('div', parseFloat(row.leftReceivable).toFixed(2));
        } 
      },
      { title: '最近挂账时间', key: 'lastCreditDate' },
      { 
        title: '操作',
        width: width,
        render: (h, { row }) => {
          let elms = [];
          // if (permissionData.check) { // 有查看权限
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$router.push("/cash/receivable/detail/" + (row.customerId || "anonymous"))
                }
              }
            }, '查看'));
          // }

          // if (permissionData.receipt) {
            if (elms.length) elms.push(h('span', ' | '));
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.currentNo = row.statementNos;
                  let html = `<p style="font-size: 12px;">收款金额：<span style="font-size: 14px;color: #ff8000;">${row.leftReceivable}</span></p><p style="font-size: 12px;">收款工单数：${row.count}</p>`
                  this.showDialog('收款', true, html);
                }
              }
            }, '收款'))
          // }

          // if (permissionData.print) {
            if (elms.length) elms.push(h('span', ' | '));
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.openPrint(row.customerId);
                }
              }
            }, '打印'))
          // }
          return elms;
        }
      }
    ];

    // if (n == 0) columns.pop();
    return {
      isShow: false, // 是否收起筛选，默认收起
      orderType: '', // 工单类型 '1': '维修单','2': '销售单', '3': '洗美单'
      title: '',
      content: '',
      showCancel: true,
      formData: {},
      params: {
        workStatus: '2,3',
        payStatus: '3'
      },
      currentNo: '',
      inputData: [
        { 
          type: 'text', 
          key: 'customerName', 
          label: '姓名', 
          holder: '输入姓名' 
        },
        { 
          type: 'text', 
          key: 'mobile', 
          label: '手机号', 
          holder: '输入手机号' 
        }
      ],
      columns
    }
  },
  
  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  methods: {
    // showForm () {
    //   this.isShow = !this.isShow;
    // },

    openPrint (customerId) {
      this.$refs.print.openPrint(customerId);
    },

    showDialog (title, cancel, content) {
      this.content = content || '';
      this.title = title;
      this.showCancel = cancel;
      this.$refs.remindDialog.openModal();
    },

    getFormData () {
      this.$refs.table.init();
    },

    remindOk () {
      if (!this.showCancel) {
        this.$refs.remindDialog.onCancel();
        return;
      };
      this.$router.push({
        path: '/cash/receivable/settle', 
        query: {
          ids: this.currentNo.join(",")
        }
      });
    }
  }
}
</script>

<style lang="less">
  .search-wrap {
    background: white;
    padding: 20px 20px 10px;
    .search-input {
      position: relative;
      width: 400px;
      // margin: 20px 0;
    }

    .search-input .ivu-input {
      padding: 0 90px 0 40px;
    }

    .search-input .ivu-input-group-append, 
    .search-input .ivu-input-group-prepend {
      position: absolute;
      right: 0;
      top: 0;
      width: 80px;
      height: 100%;
      background: #ff8800;
      z-index: 3;
      border: none!important;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      border-radius: 0;
      padding: 0;
    }
    .search-input .ivu-input-group-append {
      right: 0;
      cursor: pointer;
      span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }
    .search-input .ivu-input-group-prepend {
      left: 0;
      background: none;
      width: 40px;
      color: #332E29;
    }
  }
</style>
