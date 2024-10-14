<template>
  <!-- 车辆详情 -->
  <div class="car-detail">
    <saas-bread title="车辆详情" >
      <template slot="actions"  >
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
        <i-button type="error" @click="showVehicleDialog" v-if="isSelfStore">编辑</i-button>
      </template>
    </saas-bread>
    <div class="detail-top">
      <p class="show-top">
        <span class="plate" v-if="detail.plateNo">{{detail.plateNo}}</span>
        <span  class="plate none" v-else>暂无车牌号</span>
        <my-img :src="GET_BRAND_LOGO + detail.brandId" />
        <span>{{detail.vehicleBrand ? (detail.vehicleBrand === '其他品牌' ? detail.vehicleBrand : (detail.vehicleBrand + ' / ' + detail.carSeries + ' / ' + detail.carStyle)) : '--'}}</span>
        <span class="show-btn" @click="showDetail">
          {{isShow ? '收起' : '更多'}}车辆信息
          <Icon :type="isShow ? 'arrow-up-b' : 'arrow-down-b'"></Icon>
        </span>
      </p>
      <div class="detail-info" v-if="isShow">
        <p>
          <span>VIN码 (车架号)：{{detail.VINCode || '无'}}</span>
          <span>车身颜色：{{detail.color || '无'}}</span>
          <span>发动机号：{{detail.engineNo || '无'}}</span>
          <span>车辆类型：{{getObj(vehicleType)[detail.vehicleType] || '无'}}</span>
        </p>
        <p>
          <span>购车日期：{{(detail.buyDate && formatTime(detail.buyDate, 'yyyy-MM-dd')) || '无'}}</span>
          <span>发证日期：{{(detail.issueDate && formatTime(detail.issueDate, 'yyyy-MM-dd'))  || '无'}}</span>
          <span>注册日期：{{(detail.registDate && formatTime(detail.registDate, 'yyyy-MM-dd')) || '无'}}</span>
          <span>验车日期：{{(detail.validateDate && formatTime(detail.validateDate, 'yyyy-MM-dd')) || '无'}}</span>
        </p>
        <p>
          <span>交强险：{{detail.compulsoryInsurance || '无'}}</span>
          <span>交强险到期日期：{{(detail.compulsoryInsuranceExpireDate && formatTime(detail.compulsoryInsuranceExpireDate, 'yyyy-MM-dd')) || '无'}}</span>
          <span>商业险：{{detail.insurance || '无'}}</span>
          <span>商业险到期日期：{{(detail.insuranceExpireDate && formatTime(detail.insuranceExpireDate, 'yyyy-MM-dd')) || '无'}}</span>
        </p>
        <p>
          <span>行驶证照片：{{(detail.vehicleLicenseFrontImg ||  detail.vehicleLicenseBackImg) ? '' : '无'}}</span>
          <span>保单照片：{{detail.insuranceImg ? '' : '无'}}</span>
          <span>备注：{{detail.remark ? detail.remark : '无'}}</span>
        </p>
        <p v-if="detail.vehicleLicenseFrontImg || detail.vehicleLicenseBackImg || detail.insuranceImg">
          <span>
            <my-img v-if="detail.vehicleLicenseFrontImg" :src="getUri('checkImg') + detail.vehicleLicenseFrontImg"></my-img>
            <my-img v-if="detail.vehicleLicenseBackImg" :src="getUri('checkImg') + detail.vehicleLicenseBackImg"></my-img>
          </span>
          <span>
            <my-img v-if="detail.insuranceImg" :src="getUri('checkImg') + detail.insuranceImg"></my-img>
          </span>
        </p>
      </div>
      <Spin fix v-if="loading"></Spin>
    </div>

    <div class="record-table">
      <p class="title">消费记录</p>
      <w-table
        ref="table"
        request="customerOrderList"
        :columns="columns"
        :tableData="tableData"
        :params="{
          vehicleId: id,
          storeId:storeId,
          customerId:this.$route.query.customerId
        }">
      </w-table>
    </div>

    <remind-dialog 
      ref="remindDialog"
      title="您没有该工单权限，不能查看"
      content=""
      :showCancel="false"
      @on-ok="remindConfirm">
    </remind-dialog>
    <add-brand ref="addBrand" @on-confirm="vehicleConfirm" :auto-close="false" :required="true"></add-brand>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import remindDialog from '@/components/dialog/remind-dialog';
import AddBrand from '@/components/dialog/add-brand';
import { GET_BRAND_LOGO, getUri } from '@/https/api';
import { workType, vehicleType, getObj } from '@/store/json/default';
import { formatTime } from '@/assets/js/utils';
import '@/styles/views/customer/car-detail.less';

export default {
  data () {
    let permissionData = this.$permission.data.worker;
    return {
      GET_BRAND_LOGO,
      vehicleType,
      getObj,
      formatTime,
      getUri,
      id: this.$route.params.id,
      isShow: false,
      columns: [
        { title: '序号', type: 'index', width: 65 },
        { 
          title: '工单号', 
          key: 'statementNo'
        },
        { 
          title: '工单类型', 
          key: 'orderType',
          render: (h, { row }) => {
            return h('div', getObj(workType)[row.orderType] || '--');
          }
        },
        { 
          title: '实收金额', 
          key: 'realCost',
          sortable: 'custom'
        },
        { 
          title: '开单时间', 
          key: 'createdAt',
          render: (h, { row }) => {
            return h('div', row.createdAt || '--');
          }
        },
        { 
          title: '出厂时间', 
          key: 'factoryDate', 
          render: (h, { row }) => {
            return h('div', row.factoryDate || '--');
          }
        },
        { 
          title: '操作',
          width: 85,
          render: (h, { row }) => {
            if (!permissionData.admin) return h("span", "--");
            return h('div', [
              h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.$router.push({ path: '/workorder/' + this.checkType(row.orderType) + '/detail/' + row.statementNo + `?shareStoreId=${this.$route.query.storeId}`});
                  }
                }
              }, '查看工单')
            ])
          }
        }
      ],
      isSelfStore:true,
      storeId:this.$route.query.storeId
    }
  },

  created () {
    
  },
  mounted(){
    this.isSelfStore= this.$route.query.isSelfStore=='false'?false:true;
    this.storeId = this.$route.query.storeId;
    this.getCustomerCarDetail();
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData',
      detail: 'getCustomerCarDetail'
    }),

    ...mapState({ loading: (state) => state.global.isLoading }),
  },

  methods: {
    getCustomerCarDetail () {
      this.$store.dispatch({
        type: 'toGetCustomerCarDetail',
        params: {
          vehicleId: this.id,
          storeId: this.storeId
        }
      })
    },
    showDetail () {
      this.isShow = !this.isShow;
    },

    checkType (type) { // 工单类型
      let orderType = 'worker';
      switch (type) {
        case '1':
          orderType = 'worker';
          break;
        case '2': 
          orderType = 'sparepart';
          break;
        case '3':
          orderType = 'cleanout';
          break;
        default:
          break;
      }
      return orderType;
    },

    remindConfirm () {
      this.$refs.remindDialog.onCancel();
    },

    showVehicleDialog () {
      this.$refs.addBrand.openModal({vehicle: this.detail});
    },

    async vehicleConfirm (data) {
      try {
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'vehicleSave',
          params: data.vehicle
        });
        if (res.code === '0') {
          this.$Message.success({
            content: '保存成功',
            onClose: () => {
              data.callback();
              this.getCustomerCarDetail();
            }
          });
        } else {
          data.callback();
        }
      } catch (error) {
        data.callback();
      }
    },

  },

  components: { remindDialog, AddBrand }  
}
</script>
