<template>
  <!-- 新增编辑盘点单 -->
  <div class="deposit-add add-page">
    <saas-bread :title="isCreate ? '新增盘点单' : '编辑盘点单'">
      <template slot="actions">
        <i-button type="default" @click="back">返回</i-button>
      </template>
    </saas-bread>

    <div class="header">
      <Steps :current="step">
        <Step title="选择配件"></Step>
        <Step title="输入数量"></Step>
        <Step title="提交单据"></Step>
      </Steps>
      <Button type="text" v-if="step === 0" @click="showForm">
        <Icon v-if="isShow" type="arrow-up-b"></Icon>
        <Icon v-else type="arrow-down-b"></Icon>
        {{isShow ? '收起' : '展开'}}筛选
      </Button>
    </div>

    <add-step0 
      ref="step0"
      v-show="step === 0" 
      :isShow="isShow"
      :select-data="selectData"
      @warehouse-change="warehouseChange"
      @on-selection-change="onSelectionChange">
    </add-step0>
    <add-step1 ref="step1" v-show="step === 1" :table-data="selectData" :warehouseName="params.warehouseName"></add-step1>
    <div v-show="step === 2" class="add-step-2">
      <div class="icon"><i class="iconfont icon-wancheng-fill"></i></div>
      <p class="title">成功{{isCreate ? '新增' : '更新'}}盘点单</p>
      <!-- {{time}} 秒钟后返回配件盘点单列表 -->
      <p class="tip"></p>
      <div class="btn-con">
        <i-button type="default" @click="back">返回盘点单列表</i-button>
        <i-button type="error" @click="print">打印盘点单</i-button>
      </div>
    </div>

    <bottom-submit v-if="step !== 2">
      <span v-if="step === 0" >已选：{{selectData.length}}项</span>
      <i-button v-if="step === 0" type="error" @click="toStep(1)">下一步</i-button>
      <i-button v-if="step === 1" type="default" @click="toStep(0)">继续添加配件</i-button>
      <i-button v-if="step === 1" type="error" @click="submit()" :loading="loading">提交单据</i-button>
    </bottom-submit>
    <print-dialog ref="printDialog"></print-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import AddStep0 from './add-step0';
  import AddStep1 from './add-step1';

  import PrintDialog from './../print';
  import { storage } from '@/assets/js/utils.js';
  import '@/styles/views/inventory/deposit-add.less';
  export default {
    components: { AddStep0, AddStep1, PrintDialog },
    data () {
      const isCreate = this.$route.params.id === 'create';
      return {
        isCreate: isCreate,
        loading: false,
        time: 5,
        timer: null,
        step: 0,
        isShow: true,
        inputData: [
          { type: 'text', key: 'order', label: '配件编号', holder: '输入配件编号' },
          { type: 'text', key: 'order', label: '配件名称', holder: '输入配件名称' },
          { type: 'select', key: 'type', label: '配件子分类', holder: '选择配件子分类' }
        ],
        selectData: [],
        formData: {},
        params: {}
      }
    },
    watch: {
      detailData (to) {
        this.params.warehouseId = to.warehouseId;
        this.params.warehouseName = to.warehouseName;
        const arr = to.items;
        arr.forEach(item => {
          item.quantity = item.originQuantity;
          item.originQuantity=item.realTimeQuantity;
        })
        this.$refs.step0.onSelect(to.items);
        this.$refs.step1.remark = to.remark;
        // this.setSelectData(this.selectData);
        this.$refs.step0.warehouseChange(to, true);
      }
    },
    created () {
      if (!this.isCreate) this.step = 1;
    },
    mounted () {
      this.getDetailData();
    },
    methods: {
      init () {
        this.selectData = [];
        this.$refs.step1.remark = '';
        this.$refs.step0.getFormData({});
        this.toStep(0);
      },
      getDetailData () {
        if (!this.isCreate) {
          this.$store.dispatch({
            type: 'toGetInventoryCheck',
            payload: {
              request: 'takestockCheck',
              params: {
                inventoryId: this.$route.params.id
              }
            }
          })
        }
      },
      setSelectData (data) {
        this.$refs.step0.setSelectData(data);
      },
      warehouseChange (data) {
        this.selectData = [];
        this.params = data;
        // this.$refs.step0.setSelectData([]);
      },
      toStep (step) {
        if (step === 1 && this.selectData.length === 0) {
          this.$Message.warning('请选择至少一个配件');
          return;
        }
        this.step = step;
        // this.time = 5;
        // if (this.timer) clearTimeout(this.timer);
        // if (step === 2) {
          // this.startTimeout();
        // }
      },
      submit () {
        let params = this.$refs.step1.getFormData();
        params.warehouseId = this.params.warehouseId;
        params.warehouseName = this.params.warehouseName;
        const user = storage.get("USER");
        params.operatorId = user.userId;
        params.operatedBy = user.username;
        let request = 'takestockAdd';
        let path = '';
        let msg = '添加';
        if (!this.isCreate) {
          params.operatorId = this.detailData.operatorId;
          params.operatedBy = this.detailData.operatedBy;
          params.inventoryId = this.$route.params.id;
          request = 'takestockUpdate';
          path = '/inventory/takestock/list';
          msg = '更新';
          for(let i in params.items){
            params.items[i].originQuantity=this.detailData.items[i].realTimeQuantity
          }
        }
        this.loading = true;
        this.$store.dispatch({
          type: 'toInventoryAdd',
          payload: {
            request: request,
            params: params
          }
        }).then( res => {
          if (res.code === '0') {
            this.formData = res.data;
            this.$Message.success({
              content: msg + '成功',
              onClose: () => {
                this.toStep(2);
                this.loading = false;
              }
            });
          } else {
            this.$Message.error(msg + '失败');
            this.loading = false;
          }
        })
      },
      startTimeout () {
        this.timer = setTimeout(() => {
          this.time--;
          if (this.time < 0) {
            this.back();
            return
          }
          this.startTimeout();
        }, 1000);
      },
      removeItem (item) {
        for (let i = 0; i < this.selectData.length; i++) {
          if (this.selectData[i].componentId === item.componentId) {
            this.selectData.splice(i, 1);
            return;
          }  
        }
      },
      addItem (item) {
        for (let i = 0; i < this.selectData.length; i++) {
          if (this.selectData[i].componentId === item.componentId) {
            return false;
          }  
        }
        this.selectData.push(item);
      },
      onSelectionChange (selection, isDelete) {
        let newSelection = [];
        if (isDelete) {
          selection.forEach(item => {
            this.removeItem(item);
          });
        } else {
          // 拿原来已选的项跟当前选的项比较，如果当前的项中有已选的项不存在的，添加到已选的列表中
          selection.forEach((item, index) => {
            this.addItem(item);
          })
        }
      },

      back () {
        if (this.timer) clearTimeout(this.timer);
        this.$router.go(-1);
      },

      showForm () {
        this.isShow = !this.isShow;
      },

      print () {
        this.$refs.printDialog.openPrint(this.formData)
      }
    },
    computed: {
      ...mapGetters({
        detailData: 'getInventoryCheck'
      })
    }
  }
</script>
