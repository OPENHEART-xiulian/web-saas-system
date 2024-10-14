<template>
  <!-- 采购入库 - 采购单管理 -->
  <div >
    <div class="pd-20 white-bg">
      <saas-search-input v-model="filterText" placeholder="输入配件编号/名称 进行搜索" @on-search="onTableSearch"></saas-search-input>
    </div>

    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getComponentAllotApplys"
      :auto="true"
      :columns="columns"  
      :default-params="defaultParams"
      :params="params"
      @on-success="onTableSuccess"
      @on-loading-change="onLoadingChange">
    </saas-table>
    <Modal
      v-model="cancelModal"
      title="撤销"
      :loading = "cancelLoading"
      @on-ok="ok">
      <p>是否确认撤销此单？</p>
    </Modal> 
  </div>
</template>

<script>
import { allotComponentStatus,  getLabel } from '@/store/json/default';
import { formatTime } from '@/assets/js/utils';
export default {
  name: "allotPutList",
  props: {
    queryShow: {
      type: Boolean,
      default: false
    },
    isSelfStore:{
      type:Boolean,
      default:()=>{
        return true
      }
    }
  },
  data () {
    let permissionData = this.$permission.data.inventoryPurchasePut;
    let n = 0;
    for (const key in permissionData) {
      if (permissionData[key] && key !== 'create') n++;
    }
    let width = 180;
    if (n == 1) width = 70;
    else if (n  == 2) width = 180;
    let columns = [
      { title: '序号', type: 'index', width: 80 },
      { title: '申请单号', key: 'allotCode' },
      { title: '申请人', key: 'userName' },
      { title: '调出门店', key: 'storeName' },
      { title: '调拨数量', key: 'componentCount' },
      { 
        title: '申请时间', 
        key: 'createdAt',
        render: (h, { row }) => {
          return h('div', formatTime(row.createdAt, 'yyyy-MM-dd HH:mm:ss'))
        }     
      },
      { 
        title: '状态', 
        key: 'status',
        render: (h, { row }) => {
          return h('span', getLabel(row.status, allotComponentStatus));
        }
      },
      { 
        title: '操作',
        width,
        render: (h, { row }) => {

          const btn1 = this.getElement(h, '查看', () => {
            this.$router.push('/inventory/allot/put/detail/' + row._id);
          });
          const btn2 = this.getElement(h, '撤销', () => {
            this.cancelOrder(row._id);
          });
          // let elements = [];
          // if (row.purchaseStatus === '1') { // 未入库
          //   elements = [btn1, btn2, btn3, btn6];
          // } else if (row.purchaseStatus === '2' && row.settleStatus === '1') { // 已入库，未结算
          //   elements = [btn4, btn5, btn6];
          // } else if (row.settleStatus === '2') {
          //   elements = [btn4, btn6]
          // }
          let elms = [];
          if(this.isSelfStore && row.status === '0'){
            elms.push(btn2);
            // if (row.purchaseStatus === '1') {
            //   if (permissionData.update) elms.push(btn2);
            // }
          }
          if (permissionData.print) elms.push(btn1);
          return elms;
        }
      }
    ];
    if (n == 0) columns.pop();
    return {
      loading: false,
      permissionData,
      staffList: [],
      formData:{
        stockOutNo:''
      },
      defaultParams: {
 
      }, // 除筛选表单外的参数 
      params: {
        callType:'1'
      },
      stockOutNo: '',
      columns,
      isHeadStore:false,
      filterText:'',
      cancelModal:false,
      cancelId:'',
      cancelLoading: false
    }
  },

  mounted () {
    this.getStaffList();
  },

  activated () {
    if (this.$route.query.refresh) {
      this.$refs.table.reset();
    }
  },

  methods: {
    onTableSearch ( otherParams ) {
      this.params = Object.assign({},this.params,otherParams)
      let params = this.params;
      params.allotCode = this.filterText;
      this.$refs.table.reset();
    },
    
    // 获取员工数据
    async getStaffList () {
      try {
        let data = await this.$ajax.getStaffList();
        this.staffList = data.rows;
      } catch (error) {
        console.log(error);
      }
    },

    cancelOrder(id){
      this.cancelModal = true
      this.cancelId = id
    },

    async ok(){
      try {
        this.cancelLoading = true
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'revocationComponentAllotApply',
          params: {
            id: this.cancelId
          }
        });

        if (res.code === '0') {
          this.$Message.success({
            content: '撤销成功',
            onClose: () => {
              this.$refs.table.search();
            }
          })
        }

        this.cancelLoading = false;
      } catch (error) {
        this.cancelLoading = false;
      }
    },






    onLoadingChange (loading) {
      this.loading = loading;
    },

    onTableSuccess (data) {

    },
    // 按钮
    getElement (h, text, clickHandle) {
      return h("i-button", {
        props: {
          type: "text"
        },
        style: {
          marginRight: "5px"
        },
        on: {
          click: clickHandle || function () {}
        }
      }, text);
    }


  },
}
</script>

