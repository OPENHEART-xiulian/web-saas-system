<template>
  <!-- 退货开单 -->
  <div class="refund-add">
    <saas-bread :title="brandName">
      <template slot="actions">
        <i-button type="default" @click="goBack">取消</i-button>
      </template>
    </saas-bread>
    <div class="box-shadow">
      <i-form ref="form" :model="formData" :rules="rules" class="refund-form" label-position="top">
        <div class="form-box">
          <FormItem label="单号">
            <Input v-model="formData.returnFormCode" :disabled="true"/>
          </FormItem>
          <FormItem label="供应商" prop="supplierId" class="add-supplier">
            <Button v-if="inventorySupplier.create" type="text" @click="toAddSupplier">新增供应商</Button>
            <select-input ref="supplier" request="supplierList" filter="supplierName" item-key="supplierName" placeholder="输入关键可快速匹配供应商" @on-select="supplierSelect"/>
          </FormItem>
          <FormItem label="退货人" prop="operatorId">
            <Select v-model="formData.operatorId" placeholder="输入关键字可快速匹配退货人">
              <Option v-for="(item, index) in staffList" :key="index" :value="item.userId">{{item.username}}</Option>
            </Select>
            <!-- <select-input ref="staff" request="staffList" item-key="username" placeholder="输入关键可快速匹配退货人" @on-select="staffSelect"/> -->
          </FormItem>
          <FormItem label="开单日期" prop="orderAt">
            <DatePicker type="date" v-model="formData.orderAt" placeholder="选择日期"></DatePicker>
          </FormItem>
        </div>
        <div class="form-box">
          <FormItem label="备注">
            <Input v-model="formData.remark" />
          </FormItem>
        </div>
      </i-form>
      <div class="title">已选配件</div>
      <part-component ref="part" class="part-list" :auto-init="true" @on-change="partChange" />
    </div>
    <bottom-submit>
      <div class="slot-left">
        <p class="price">退货金额：<span>￥{{totalCost | toFixed}}</span></p>
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
  import PartComponent from './part-component';
  import addSupplier from '@/components/dialog/add-supplier-dialog';
  import { formatTime, storage } from '@/assets/js/utils.js';

  export default {
    components: { SelectInput, PartComponent, addSupplier },
    data () {
      const status = this.$route.params.id === 'create';
      let { inventorySupplier } = this.$permission.data;
      return {
        inventorySupplier,
        loading: false,
        brandName: status ? '新增退货单' : '更新退货单',
        status: status,                         // 编辑状态 true： 新增   false： 更新
        supplierList: [],                       // 供应商列表
        staffList: [],
        defaultPartList: [],
        totalCate: 0,                           // 配件种类数
        totalCount: 0,                          // 配件总数
        totalCost: 0,                           // 采购总金额
        formData: {
          returnFormCode: '',                   // 退货单号
          supplierId: '',                       // 供应商id
          operatorId: '',                       // 退货人id
          orderAt: new Date(),                  // 开单日期
          remark: '',                           // 备注
          components: []
        },
        rules: {
          supplierId: [{ required: true, message: '请选择供应商' }],
          operatorId: [{ required: true, message: '请选择退货人' }],
          orderAt: [{ required: true, message: '请选择开单日期', type: 'date' }]
        }
      }
    },
    mounted () {
      this.init();
    },
    methods: {
      init () {
        if (this.status) {
          this.getCode();
          this.$refs.part.setDefaultList([]);
        } else {
          this.getDetail();
        }
        this.getStaffList();
      },

      toAddSupplier () {
        this.$refs.addSupplier.openModal();
      },
      
      // 获取员工数据
      async getStaffList () {
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'staffList'
          });

          if (res.code === '0') {
            this.staffList = res.data.rows;
            this.formData.operatorId = storage.get('USER').userId;
          }
        } catch (error) {
          
        }
      },
      // 获取详情， 更新的时候
      async getDetail () {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'refundDetail',
          params: {
            returnFormId: this.$route.params.id
          }
        });

        if (res.code === '0') {
          this.formData = res.data;
          this.$refs.supplier.setData(this.formData.supplierName);
          // this.$refs.staff.setData(this.formData.operatedBy);
          this.$refs.part.setDefaultList(this.formData.components);
        }
      },
      // 获取退货单号 新增的时候
      async getCode () {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'refundGet'
        });

        if (res.code === '0') {
          this.formData.returnFormCode = res.data.returnFormCode;
        }
      },
      // 供应商选择回调
      supplierSelect (data) {
        this.formData.supplierId = data.supplierId;
      },
      // 采购人选择回调
      staffSelect (data) {
        this.formData.operatorId = data.userId;
      },
      // 配件选择回调
      partChange (cost, count, cateCount) {
        this.totalCost = cost;
        this.totalCate = cateCount;
        this.totalCount = count;
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
        formData.orderAt = formatTime(formData.orderAt, 'yyyy-MM-dd');

        if (formData.components.length === 0) {
          this.$Message.warning('请选择配件');
          return;
        }

        if (isValid) {
          let requert = "refundAdd";
          if (!this.status) {
            requert = "refundUpdate";
            formData.returnFormId = this.$route.params.id;
          };
          const res = await this.$store.dispatch({
            type: 'actionPost',
            name: requert,
            params: formData
          });

          if (res.code === '0') {
            this.$Message.success({
              content: '保存成功',
              onClose: () => {
                // this.$store.commit("setKeepAliveData", { name: "InventoryPurchase", value: false });
                this.$router.replace({
                  path: '/inventory/purchase/list?name=RefundList',
                  query: {
                    refresh: true
                  }
                })
              }
            })
          }
        } else {
          this.$Message.warning('请检查退货单信息');
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
