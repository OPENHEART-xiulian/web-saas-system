<template>
  <!-- 保养提醒 -->
  <div class="relative mt-20 white-bg">
    <div class="pt-20 pl-20 pr-20">
      <saas-search-input v-model="params.name" placeholder="输入客户名称 / 联系电话" @on-search="onTableSearch"></saas-search-input>
    </div>
    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getCareRemindList"
      :auto="true"
      :columns="columns"  
      :params="params"
      :close-loading="true"
      @on-success="onTableSuccess"
      @on-loading-change="onLoadingChange">
    </saas-table>
    <Spin size="large" fix v-if="loading"></Spin>
    <Modal class="adModal" v-model="modal" title="建议维修里程"  @on-ok="updateRemindStatus">
      <div class="title">
        车牌号码：{{formData.plateNo}}
        <img :src="GET_BRAND_LOGO + formData.brandId" alt="" class="car_logo">
        <span>{{formData.vehicleBrand}}{{formData.carSeries}}</span>
      </div>
      <Form :label-width="140" :rules="rules">
        <FormItem label="送修时间" >
          <span>{{moment(formData.createdAt).format("YYYY-MM-DD")}}</span>
        </FormItem>
        <FormItem label="送修里程" >
          <format-input v-model="formData.deliveryMileage" :min="0" reg="PRECISION" :disabled="true">
            <span slot="append">KM</span>
          </format-input>
        </FormItem>
        <FormItem label="当前建议保养里程" >
          <format-input v-model="formData.adviceMileage" :min="0" reg="PRECISION" :disabled="true">
            <span slot="append">KM</span>
          </format-input>
        </FormItem>
        <FormItem label="下次保养里程">
          <format-input v-model="remindStatusObj.adviceMileage" :min="0" reg="PRECISION">
            <span slot="append">KM</span>
          </format-input>
        </FormItem>
        <FormItem label="下次保养时间" prop="maintainExpDate">
          <DatePicker type="date" 
            placeholder="选择时间" 
            style="width: 180px"
            v-model="remindStatusObj.maintainExpDate"
          >
          </DatePicker>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
  import moment from "moment"
  import commonColumns from "@/commons/columns/common-column";            // 表格的列 -> 公共 
  import customerColumns from "@/commons/columns/customer-column";        // 表格的列 -> 客户
  import remindColumns from "@/commons/columns/remind-column";            // 表格的列 -> 客户提醒
  import vehicleColumns from "@/commons/columns/vehicle-column";          // 表格的列 -> 车辆
  import { GET_BRAND_LOGO } from "@/https/api";
  import { workType } from '@/store/json/default';
  import { formatTime } from '@/assets/js/utils.js'
  import mixins from "./minix";
  export default {
    mixins: [mixins],
    data () {
      let status = 3; // 提醒类型：{ 0: 生日提醒, 1: 保险提醒, 2: 年检提醒, 3: 保养提醒, 4: 回访提醒 }
      //    提醒权限         维修工单    洗美工单         销售工单          退货工单
      let { customerRemind, workerList, workerCleanout, workerSparepart, workerSalereturn } = this.$permission.data;
      let columns = [
        commonColumns.index(),                                 // 序号
        customerColumns.name({ key: "repairName" }),           // 客户姓名
        customerColumns.mobile({ key: "repairMobile" }),       // 手机号码
        vehicleColumns.vehicleStyle({ hasPlate: true }),       // 详细车型,包括车牌号码
        vehicleColumns.maintainExpire(),                       // 保养到期日期
        vehicleColumns.prevRepariDate(),                       // 上次维修日期
        remindColumns.distanceDays({ sortable: "custom" }),    // 距离天数
        customerColumns.before(),       //上次送修里程
        customerColumns.ad()        //建议保养里程
      ];
      
      // 有操作权限就添加处理状态
      if (customerRemind.operation) {
        columns.push(
          {
            title: "状态",
            key: "remindStatus",
            minWidth: 120,
            render: (h, { row }) => {
              // row.remindStatus { 0: 未处理, 1: 已处理 }
              let { remindStatus } = row;
              // switch组件
              let switchElm = h("i-switch", {
                props: {
                  value: String(remindStatus),
                  trueValue: "0",   // 选中代表未处理
                  falseValue: "1"   // 不选择代表已处理
                },
                on: {
                  // 更新状态
                  "on-change": v => {
                    row.remindStatus = v;
                    params.update(row, params.status, params.statusKey)
                  }
                }
              });

              let box = h("div", {
                style: { position:'absolute', width:'100%', height:'100%','z-index':2, cursor: Number(remindStatus) === 1?"not-allowed":"pointer" },
                on: {
                  click:()=>{
                    if(Number(remindStatus) === 1) return 
                    this.formData = Object.assign({},row)
                    this.modal = true
                  }
                }
              })

              let textElm = h("span", {
                style: { marginLeft: "4px" }
              }, remindStatus == 1 ? '已处理' : '未处理');
              
              return h("div", {
                style: { display: "flex", position: "relative" }
              }, [ box, switchElm, textElm ]);
            }
          }
        );
      }

      // 有查看权限就添加查看按钮
      if (workerList.check || workerCleanout.check || workerSparepart.check || workerSalereturn.check) {
        columns.push({
          title: "操作",
          width: 80,
          fixed: "right",
          render: (h, { row }) => {
            let { orderType } = row;
            // { value: '1', label: '维修工单', pathType: 'worker' },
            // { value: '2', label: '配件销售', pathType: 'sparepart' },
            // { value: '3', label: '洗美工单', pathType: 'cleanout' },
            // { value: '4', label: '退货工单', pathType: 'salereturn' }
            // 工单类型对应且有权限
            let hasCheck = (workerList.check && orderType == 1) || (workerCleanout.check && orderType == 3) || 
                            (workerSparepart.check && orderType == 2) || (workerSalereturn.check && orderType == 4);
            let item = workType.find(elm => elm.value === orderType);
            let pathType = item.pathType;
            let elm = h("Button", {
              props: {
                type: 'text',
                to: `/workorder/${pathType}/detail/${row.statementNo}`
              }
            }, "查看工单");
            return hasCheck ? elm : ["--"];
          }
        });
      }

      return {
        params: {
          name: "",
          status
        },
        columns,
        modal: false,
        formData:{
          brandId:'',
          nextDelivery:'',
          nextTime:'',
        },
        GET_BRAND_LOGO,
        remindStatusObj:{
          customerId:'',
          vehicleId:'',
          maintainExpDate:'',
          adviceMileage:0
        },
        rules: {
          maintainExpDate: [{ required: true, message: '请选择时间', trigger: 'blur' },]
        }
      };
    },

    methods:{
      moment,
      async updateRemindStatus(){
        const remindStatusObj = Object.assign({},this.remindStatusObj)
        remindStatusObj.adviceMileage = Number(remindStatusObj.adviceMileage)
        remindStatusObj.customerId = this.formData.customerId
        remindStatusObj.vehicleId = this.formData.vehicleId
        remindStatusObj.maintainExpDate = this.moment(remindStatusObj.maintainExpDate).format("YYYY-MM-DD");
        remindStatusObj.status = '3'
        remindStatusObj.remindStatus = Number(this.formData.remindStatus)===0?'1':'0'
        remindStatusObj.distanceDays = moment(this.moment(remindStatusObj.maintainExpDate).format("YYYY-MM-DD")).diff(moment(this.formData.createdAt), 'days')
        remindStatusObj.statementNo = this.formData.statementNo
        try{
          const res = await this.$store.dispatch({
            name: "updateRemindStatus",
            type: "actionPost",
            params: remindStatusObj
          })
          if(Number(res.code) === 0){
            this.$Message.success({
              content: "更新成功",
              onClose: () => {
                this.modal = false
                this.$refs.table.search()
              },
            })
          }else{
            this.$Message.error(res.msg)
          }

        }catch(error){
          console.log(this.error)
        }
      },
    }
  }
</script>

<style lang="less" scoped>
.adModal{
  .title{
    display: flex;
    align-items: center;
    .car_logo{
      height:40px;
      margin:0 10px;
    }
    border-bottom:1px solid #f5f5f5;
    padding-bottom: 15px;
  }
}
</style>
