<template>
  <!-- 新建编辑调拨单 -->
  <div class="refund-add">
    <saas-bread :title="brandName">
      <template slot="actions">
        <Button type="default" @click="goBack">取消</Button>
      </template>
    </saas-bread>
    <div class="box-shadow">
      <i-form ref="form" :model="formData" :rules="rules" class="refund-form" label-position="top">
        <div class="form-box">
          <!-- <FormItem label="单号" prop="purchaseCode">
            <Input v-model="formData.purchaseCode" :disabled="true"/>
          </FormItem> -->
          <FormItem label="制单人" prop="creatorId">
            <Select v-model="formData.creatorId">
              <Option v-for="(item, index) in staffList" :key="index" :value="item.userId">{{item.username}}</Option>
            </Select>
          </FormItem>
          <FormItem label="调拨人" prop="operatorId">
            <Select v-model="formData.operatorId">
              <Option v-for="(item, index) in staffList" :key="index" :value="item.userId">{{item.username}}</Option>
            </Select>
          </FormItem>
          <FormItem label="调拨类型" prop="allotType">
            <Select v-model="formData.allotType" :disabled="!this.$storage.get('STORE').isChainStore">
              <Option v-for="(item, index) in allotTypeList" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
          </FormItem>
          <FormItem></FormItem>
        </div>
        <div class="form-box" v-if="formData.allotType === '1'">
          <FormItem label="调入申请单号" prop="allotApplyNo" >
            <Input v-model="formData.allotApplyNo" search  @on-search="searchNumber"/>
          </FormItem>
          <FormItem label="调入门店">
            <span>{{storeName || '--'}}</span>
          </FormItem>
          <FormItem label="备注">
            <Input v-model="formData.remark" />
          </FormItem>
          <FormItem></FormItem>
        </div>
        <div class="form-box" v-if="formData.allotType === '0'">
          <FormItem label="备注">
            <Input v-model="formData.remark" />
          </FormItem>
          <FormItem></FormItem>
        </div>
      </i-form>
      <div class="title">已选配件</div>
      <part-component ref="part" class="part-list" @on-change="partChange" :allotType="formData.allotType" :isCommon="isCommon"/>
      <Spin v-if="loading" fix></Spin>
    </div>
    <bottom-submit>
      <div class="slot-left">
        <p><span>调仓数量: {{totalCount}} 件</span></p>
        <p><span>{{totalCate}} 种配件</span></p>
      </div>
      <i-button type="error" :loading="loading" @click="submit">{{brandName}}</i-button>
    </bottom-submit>
  </div>
</template>

<script>
  import '@/styles/views/inventory/refund-add.less';
  import PartComponent from "./part-component";
  import { formatTime, storage } from '@/assets/js/utils.js';
  import { allotTypeList } from '@/store/json/default'
  export default {
    components: { PartComponent },
    data () {
      const status = this.$route.params.id === 'create';
      return {
        loading: false,
        brandName: status ? '生成调拨单' : '更新调拨单',
        status: status,                         // 编辑状态 true： 新增   false： 更新
        staffList: [],
        defaultPartList: [],
        totalCate: 0,                           // 配件种类数
        totalCount: 0,                          // 配件总数
        formData: {
          creatorId: '',                        // 制单人id
          operatorId: '',                       // 调拨人id
          remark: '',                           // 备注
          components: [],
          allotType:'0',
          allotApplyNo:'',
          callinStoreId:''
        },
        initFormData: {
          remark: '',
          components: [],
          allotType:'0',
          allotApplyNo:'',
          callinStoreId:''
        },
        allotTypeList,
        storeName:'',
        rules: {
          creatorId: [{ required: true, message: '请选择制单人' }],
          operatorId: [{ required: true, message: '请选择调拨人' }],
          allotApplyNo: [{ required: true, message: '请输入申请单号' }]
        }
        
      }
    },
    
    computed: {
      isCommon(){
        return this.formData.allotType === '0'? true : false
      }
    },

    
    watch: {
      'formData.allotType':function(n,o){
        if(n === '0'){
          this.initFormDataFn()
        }else{
          this.formData.components = []
          this.$refs.part.setDefaultList(this.formData.components);
        }
      }
    },
    mounted () {
      //this.$refs.part.getWarehouseList();
      this.init();
    },
    methods: {
      
      async searchNumber(e){
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'getAllotApplyByallotCode',
            params: {
              allotCode: e
            }
          });

          if (res.code === '0') {
            if(!res.data.allotCode){
              this.formData.callinStoreId = ''
              this.storeName = ''
            }else{
              this.formData.callinStoreId = res.data.callinStoreId._id
              this.formData.components = res.data.components
              this.storeName = res.data.callinStoreId.storeName
              this.formData.components.map(item=>{
                item.purchasePrice = item.retailPrice
              })
              this.$refs.part.setDefaultList(this.formData.components);
            }
          }

          this.$Message.error(res.msg)
        } catch (error) {
          console.log(error)
        }
      },

      async init () {
        const routeQuery = this.$route.query
        this.formData.creatorId = storage.get('USER').userId;
        this.formData.operatorId = storage.get('USER').userId;
        this.loading = true;
        try {
          await this.getStaffList();
          this.$refs.part.setDefaultList(this.formData.components);
          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
        if(routeQuery.allotType && routeQuery.allotType ==='1'){
           this.formData.allotType = routeQuery.allotType
           console.log(this.formData.allotType)
           this.formData.allotApplyNo = routeQuery.allotApplyNo
           this.searchNumber(routeQuery.allotApplyNo)
        }
      },

      initFormDataFn(){
        this.formData = Object.assign({},this.formData,JSON.parse(JSON.stringify(this.initFormData)))
        this.$refs.part.setDefaultList(this.formData.components);
      },  

      // 获取员工数据
      async getStaffList () {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'staffList'
        });
        if (res.code === '0') {
          this.staffList = res.data.rows;
        }
      },
      // 配件选择回调
      partChange (data, quantity) {
        this.formData.components = data;
        this.totalCate = data.length;
        this.totalCount = parseFloat(quantity.toFixed(2));
      },

      async submit () {
        let isValid = false;
        this.$refs.form.validate(valid => {
          if (valid) {
            isValid = valid;
          }
        });
        const formRows = this.$refs.part.getRows()
        const formData = Object.assign({}, this.formData);
        
        formData.components = JSON.parse(JSON.stringify(formRows))

        if (formData.components.length === 0) {
          this.$Message.warning('请选择配件');
          return;
        }

        formData.components.map(item=>{
          item.componentId?'':item.componentId=item._id
        })


        if (isValid) {
          this.loading = true;
          const res = await this.$store.dispatch({
            type: 'refundActionPost',
            name: "componentAllotSave",
            params: formData
          });

          if (res.code === '0') {
            this.$Message.success({
              content: '保存成功',
              onClose: () => {
                this.loading = false;
                this.$router.push('/inventory/allocation');
              }
            });
          } else {
            this.$Message.warning(res.msg);
            this.loading = false;
          }
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
