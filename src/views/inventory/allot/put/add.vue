<template>
  <!-- 采购开单 -->
  <div class="refund-add">
    <saas-bread :title="brandName">
      <template slot="actions">
        <i-button type="default" @click="goBack">取消</i-button>
      </template>
    </saas-bread>
    <div class="box-shadow">
      <i-form ref="form" :model="formData" :rules="rules" class="refund-form" label-position="top">
        <div class="form-box">
          <FormItem label="申请人" prop="creatorId">
            <Select v-model="formData.creatorId" placeholder="请选择申请人">
              <Option v-for="(item, index) in userList" :key="index" :value="item._id">{{item.username}}</Option>
            </Select>
            <!-- <select-input ref="staff" request="staffList" item-key="username" placeholder="输入关键可快速匹配采购人" @on-select="staffSelect"/> -->
          </FormItem>
          <FormItem label="调出门店" prop="calloutStoreId">
            <Select v-model="formData.calloutStoreId" placeholder="请选择门店" @on-change="onStoreChange">
              <Option v-for="(item, index) in storeList" :disabled="item._id === selfStoreId" :key="index" :value="item._id">{{item.storeName}}</Option>
            </Select>
            <!-- <select-input ref="staff" request="staffList" item-key="username" placeholder="输入关键可快速匹配采购人" @on-select="staffSelect"/> -->
          </FormItem>
          <FormItem label="调拨费用">
            <format-input
              prelen="2"
              v-model="formData.calloutTotalCost"
              placeholder="输入调拨费用"
              reg="PRECISION"
            >
              <span slot="append">元</span>
            </format-input>
          </FormItem>
          <FormItem label=" ">
            <RadioGroup  v-model="formData.assumeStatus">
              <Radio :value="item.value" v-for="item in assumeStatusList" :key="item.value" :label="item.value">
                {{item.label}}
              </Radio>
            </RadioGroup >
          </FormItem>
        </div>
        <div class="form-box">
          <FormItem label="备注">
            <Input v-model="formData.remark" />
          </FormItem>
        </div>
      </i-form>
      <div class="title">已选配件</div>
      <part-component ref="part" class="part-list" :params="partParams" :auto-init="false" @on-change="partChange" />
      <Spin v-if="loading" fix></Spin>
    </div>
    <bottom-submit>
      <!-- <div class="slot-left">
        <p class="price">采购金额：<span>￥{{totalCost | toFixed}}</span></p>
        <p>
          <span>{{totalCate}}种共计{{totalCount}}件</span>
        </p>
      </div> -->
      <i-button type="default" @click="$router.go(-1)">取消</i-button>
      <i-button type="error" :loading="loading" @click="submit">生成调入申请</i-button>
    </bottom-submit>
    <add-supplier ref="addSupplier"></add-supplier>
  </div>
</template>

<script>
  import '@/styles/views/inventory/refund-add.less';
  import SelectInput from './select-input';
  import PartComponent from './part-component';
  import addSupplier from '@/components/dialog/add-supplier-dialog';
  import { formatTime, storage } from '@/assets/js/utils.js';

  export default {
    components: { SelectInput, PartComponent, addSupplier },
    data () {
      let { inventorySupplier } = this.$permission.data;
      return {
        inventorySupplier,
        loading: false,
        selfStoreId:storage.get('USER').storeId || '',
        brandName: '新增调入申请',
        formData: {
          creatorId:storage.get('USER').userId || '',
          operatorId:'',
          calloutStoreId:'',
          calloutTotalCost:0,
          remark: '',                           // 备注
          components: [],
          assumeStatus:'0'
        },
        rules: {
          // supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
          // operatorId: [{ required: true, message: '请选择采购人' }],
          // orderAt: [{ required: true, message: '请选择开单日期', type: 'date' }]
        },
        userList:[],
        storeList:[],
        partParams:{
          storeId: ''
        },
        assumeStatusList:[
          {
            label:'调入方承担',
            value:'0'
          },
          {
            label:'调出方承担',
            value:'1'
          }
        ]
      }
    },
    mounted () {
      this.init();
    },
    methods: {
      init () {
        this.getUserListByAllot()
        this.getStoreListByAllot()
      },

      onStoreChange(v){
        this.partParams.storeId = v
      },

      toAddSupplier () {
        this.$refs.addSupplier.openModal();
      },

      async getUserListByAllot () {
        try{
          const res = await this.$store.dispatch({
            type: "actionGet",
            name: "getUserListByAllot"
          });
  
          if (res.code === "0") {
            this.userList = res.data.rows
          }else{
            this.$Message.error(res.msg)
          }
        }catch(error){
          console.log(error)
        }
      },
      async getStoreListByAllot () {
        try{
          const res = await this.$store.dispatch({
            type: "actionGet",
            name: "getStoreListByAllot"
          });
          if (res.code === "0") {
            this.storeList = res.data.rows
            if(this.storeList.length>0){
              const masterStoreId = this.storeList[0].masterStoreId
              this.formData.calloutStoreId = this.storeList[0]._id
              this.partParams.storeId = this.storeList[0]._id
            }
          }else{
            this.$Message.error(res.msg)
          }
        }catch(error){
          console.log(error)
        }
      },
      // 获取详情， 更新的时候
      async getDetail () {
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'purchaseDetail',
            params: {
              purchaseId: this.$route.params.id
            }
          });
          if (res.code === '0') {
            this.formData = res.data;
            this.$refs.supplier.setData(this.formData.supplierName);
            // this.$refs.staff.setData(this.formData.operatedBy);
            this.$refs.part.setDefaultList(this.formData.components);
          }
          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },
      // 获取采购单号 新增的时候
      async getCode () {
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'purchaseGet'
          });
          if (res.code === '0') {
            this.formData.purchaseCode = res.data.purchaseCode;
          }
          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },
      // 供应商选择回调
      supplierSelect (data) {
        this.formData.supplierId = data.supplierId;
      },
      // 配件选择回调
      partChange (cost, count, cateCount) {
        this.totalCost = cost;
        this.totalCate = cateCount;
        this.totalCount = count;
      },

      cerifyPurchasePrice (arr) {
        let isTrue = true
        for (let n = 0; n < arr.length; n++) {
          if (arr[n].purchasePrice && Number(arr[n].purchasePrice) === 0) {
            console.log('178')
            isTrue = false;
            break;
          }
        }
        return isTrue
      },

      async submit () {
        let isValid = false;
        this.$refs.form.validate(valid => {
          if (valid) {
            isValid = valid;
          }
        });
        const formData = Object.assign({}, this.formData);
        formData.components = this.$refs.part.getFormRows();
        formData.operatorId = formData.creatorId
        formData.calloutTotalCost = Number(formData.calloutTotalCost)

        if (formData.components.length === 0) {
          this.$Message.warning('请选择配件');
          return;
        }

        if (isValid) {
          this.loading = true;
          let requert = "createComponent";

          const res = await this.$store.dispatch({
            type: 'refundActionPost',
            name: requert,
            params: formData
          });

          if (res.code === '0') {
            this.$Message.success({
              content: '保存成功',
              onClose: () => {
                this.loading = false;
                // this.$store.commit("setKeepAliveData", { name: "InventoryPurchase", value: false });
                this.$router.replace({
                  path: '/inventory/allot/list',
                  query: {
                    refresh: true
                  }
                })
              }
            })
          } else {
            this.loading = false;
          }
        } else {
          this.$Message.warning('请检查采购单信息');
        }
      },
      goBack () {
        this.$router.go(-1);
      }
    },
    filters: {
      toFixed (v) {
        return v ? Number(v).toFixed(2) : 0;
      }
    }
  }
</script>
