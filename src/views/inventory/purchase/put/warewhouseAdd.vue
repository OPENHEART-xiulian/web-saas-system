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
          <FormItem label="操作人" >
            <Select v-model="formData.operatorId" placeholder="输入关键字可快速匹配采购人">
              <Option v-for="(item, index) in staffList" :key="index" :value="item.userId">{{item.username}}</Option>
            </Select>
          </FormItem>
          <FormItem label="入库类型" >
            <Select v-model="formData.stockInType" placeholder="">
              <Option v-for="(item, index) in storageType" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="备注" v-if="formData.stockInType === '0'">
            <Input v-model="formData.remark" />
          </FormItem>
          <FormItem v-else />
          <FormItem />
        </div>
        <div class="form-box" v-if="formData.stockInType === '1'">
          <FormItem label="出库单号" prop="stockOutNo">
            <Input v-model="formData.stockOutNo" search  @on-search="searchNumber"/>
          </FormItem>
          <FormItem label="调拨门店">
            <span>{{formData.callOutStoreName || '--'}}</span>
          </FormItem>
          <FormItem label="调拨单号">
            <span>{{formData.allotCode || '--'}}</span>
          </FormItem>
          <FormItem label="备注">
            <Input v-model="formData.remark" />
          </FormItem>
        </div>
      </i-form>
      <div class="title">已选配件</div>
      <Warehouse-part-component ref="part" class="part-list" :auto-init="false" @on-change="partChange" />
      <Spin v-if="loading" fix></Spin>
    </div>
    <bottom-submit>
      <div class="slot-left">
        <p class="price">入库金额：<span>￥{{totalCost | toFixed}}</span></p>
        <p>
          <span>{{totalCate}}种共计{{totalCount}}件</span>
        </p>
      </div>
      <i-button type="error" :loading="loading" @click="submit">保存</i-button>
    </bottom-submit>
    <add-supplier ref="addSupplier"></add-supplier>
  </div>
</template>

<script>
  import '@/styles/views/inventory/refund-add.less';
  import SelectInput from './select-input';
  import WarehousePartComponent from './warehouse-part-component';
  import addSupplier from '@/components/dialog/add-supplier-dialog';
  import { formatTime, storage } from '@/assets/js/utils.js';
  import { storageType } from '@/store/json/default'
  export default {
    components: { SelectInput, WarehousePartComponent, addSupplier },
    data () {
      const status = this.$route.params.id === 'create';
      let { inventorySupplier } = this.$permission.data;
      return {
        inventorySupplier,
        loading: false,
        brandName: status ? '新增配件单' : '更新配件单',
        status: status,                         // 编辑状态 true： 新增   false： 更新
        supplierList: [],                       // 供应商列表
        staffList: [],
        defaultPartList: [],
        totalCate: 0,                           // 配件种类数
        totalCount: 0,                          // 配件总数
        totalCost: 0,                           // 采购总金额
        formData: {
          allotApplyNo:'',
          stockOutNo: 'CK202010190013',                    
          operatorId: '',                  
          remark: '',                      
          stockInType:'1',
          purchaseCode:'',
          callOutStore:'',
          allotCode:'',
          items:[]
        },
        rules: {
          stockOutNo: [{ required: true, message: '请选择出库单号' }],
        },
        storageType
      }
    },
    mounted () {
      this.init();
      this.searchNumber('CK202010190013')
    },
    methods: {
      async searchNumber(e){
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'outputCheck',
            params: {
              stockOutNo: e
            }
          });

          if (res.code === '0') {
            if(!res.data.stockOutNo){
              this.formData.stockOutNo = ''
              this.storeName = ''
            }else{
              this.formData.items = res.data.items
              this.formData.allotCode = res.data.allotCode
              this.formData.callOutStore = res.data.callOutStore 
              this.formData.callOutStoreName = res.data.callOutStoreName 
              this.$refs.part.setDefaultList(this.formData.items);
            }
          }

          this.$Message.error(res.msg)
        } catch (error) {
          console.log(error)
        }
      },



      init () {
        this.getStaffList();
      },

      toAddSupplier () {
        this.$refs.addSupplier.openModal();
      },

      // 获取员工数据
      async getStaffList () {
        try {
          this.loading = true;
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'staffList',
            params: {
              page: 1,
              rows: 100
            }
          });

          if (res.code === '0') {
            this.staffList = res.data.rows;
            this.formData.operatorId = storage.get('USER').userId;
          }
          
          if (this.status) {
            this.getCode();
            this.$refs.part.setDefaultList([]);
          } else {
            this.getDetail();
          }
        } catch (error) {
          this.loading = false;
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
      // 获取配件单号 新增的时候
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
        formData.items = this.$refs.part.getFormRows()

        if (formData.items.length === 0) {
          this.$Message.warning('请选择配件');
          return;
        }
  
        if (!this.cerifyPurchasePrice(formData.items)) {
          this.$Message.warning('配件单价不能为0');
          return
        }
        if (isValid) {
          this.loading = true;
          let requert = "addPartStockin";

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
                  path: '/inventory/purchase/list',
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
          this.$Message.warning('请检查配件单信息');
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
