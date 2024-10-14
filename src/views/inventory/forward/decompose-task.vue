<template>
  <!-- 分解任务 -->
  <div class="forward-decompose">
    <saas-bread title="分解任务"></saas-bread>
    <div class="detail-top">
      <p><span>工单号</span>{{ detail.statementNo || '--' }}</p>
      <p><span>客户</span>{{ detail.vehicleOwner || '--' }} | {{ detail.ownerMobile || '--' }} | {{ detail.plateNo || '--' }}</p>
      <p><span>开单日期</span>{{ detail.orderAt || '--' }}</p>
      <Spin fix v-if="loading"></Spin>
    </div>
    <p class="text">已选配件（{{ detail.components && detail.components.length || 0 }}）</p>
    <div class="decompose-table">
      <table>
        <thead>
          <th>序号</th>
          <th>配件编号</th>
          <th>原厂编码</th>
          <th>名称</th>
          <th>品牌</th>
          <th>单位</th>
          <th>分类</th>
          <th style="width: 90px;">供应商</th>
          <th style="width: 90px;">采购人</th>
          <th>采购数量</th>
          <th style="width: 90px;">采购单价</th>
          <th>金额</th>
        </thead>
        <tbody>
          <tr v-for="(item, index) in detail.components"
            :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.partNo || '--' }}</td>
            <td>{{ item.partFactoryNo || '--' }}</td>
            <td>{{ item.partName }}</td>
            <td>{{ item.brand || '--' }}</td>
            <td><my-unit :unit="item.unit"></my-unit></td>
            <td>{{ item.cateStr && item.cateStr.split('/').pop() || '--' }}</td>
            <td>
              <Select v-model="item.supplierId" filterable>
                <Option v-for="supplierItem in supplierList"
                  :key="supplierItem.supplierId"
                  :value="supplierItem.supplierId">{{ supplierItem.supplierName }}
                </Option>
              </Select>
              <span class="err-tip"
                v-if="!item.supplierId && supplierErr">请选择供应商</span>
            </td>
            <td>
              <Select v-model="item.operatorId">
                <Option v-for="staffItem in staffList"
                  :key="staffItem.userId"
                  :value="staffItem.userId">{{ staffItem.username }}
                </Option>
              </Select>
              <span class="err-tip"
                v-if="!item.operatorId && operatorErr">请选择采购人</span>
            </td>
            <td>{{ item.quantity }}</td>
            <td>
              <format-input
                reg="PRECISION"
                v-model="item.purchasePrice">
              </format-input>
              <span class="err-tip"
                v-if="!item.purchasePrice && priceErr">请输入单价</span>
            </td>
            <td>{{ Math.round(parseFloat(item.purchasePrice * item.quantity) * 100) / 100 }}</td>
          </tr>
          <tr v-if="detail.components && detail.components.length <= 0">
            暂无数据
          </tr>
        </tbody>
      </table>
      <Spin fix v-if="loading"></Spin>
    </div>

    <bottom-submit sumbitBtn="分解任务"
      @on-cancel="cancel"
      @on-confirm="confirm">
    </bottom-submit>

    <remind-dialog ref="remindDialog"
      title="分解任务"
      content="分解任务后，已选配件的信息将不可再修改，确定分解任务？"
      :loading="btnLoading"
      @on-ok="onOk">
    </remind-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import remindDialog from '@/components/dialog/remind-dialog';
import { unit, getObj } from '@/store/json/default';
import '@/styles/views/inventory/forward-decompose.less';

export default {
  data () {
    return {
      unit,
      getObj,
      id: this.$route.params.id,
      btnLoading: false,
      obj: {},
      supplierErr: false,
      operatorErr: false,
      priceErr: false,
      detail: {}
    }
  },

  created () {
    this.init();
  },
  
  watch: {
    staffList (to) {
      this.$store.dispatch({
        type: 'toGetTaskDetail',
        params: {
          statementNo: this.id
        }
      });
    },
    detailData (to) {
      to.components.forEach(elm => {
        elm.operatorId = this.staffList[0].userId;
      });
      this.detail = to;
    }
  },

  computed: {
    ...mapGetters({
      detailData: 'getTaskDetail',
      staffList: 'getStaffList',
      supplierList: 'getSupplierList'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  methods: {
    init () {
      this.$store.dispatch('toGetStaffList');
      this.$store.dispatch('toGetSupplierList');
    },

    cancel () {
      this.$router.go(-1);
    },

    confirm () {
      this.obj = this.getComponents();
      if (!this.obj.err) this.$refs.remindDialog.openModal();
    },

    getComponents () {
      const arr = [];
      let err = false;
      this.supplierErr = false;
      this.operatorErr = false;
      this.priceErr = false;
      this.detail.components.forEach(item => {
        if (!item.supplierId || !item.operatorId || !item.purchasePrice) {
          err = true;
        }
        if (!item.supplierId) this.supplierErr = true;
        if (!item.operatorId) this.operatorErr = true;
        if (!item.purchasePrice) this.priceErr = true;
        arr.push({
          supplierId: item.supplierId,
          operatorId: item.operatorId,
          purchasePrice: String(parseFloat(item.purchasePrice))
        })
      })

      const params = {
        err: err,
        arr: arr
      };

      return params;
    },

    onOk () {
      this.btnLoading = true;
      const params = {
        statementNo: this.id,
        components: this.obj.arr
      }
      this.$store.dispatch({
        type: 'toDecomposeTask',
        params
      }).then((res) => {
        this.btnLoading = false;
        if (res.code === '0') {
          // 取消即进即出组件的缓存，因为跳转回去需要刷新页面
          this.$store.commit("setKeepAliveData", { name: "InventoryForward", value: false });
          this.$router.push('/inventory/forward/list?name=PaymentList');
        } else {
          this.$Message.warning('分解失败，请稍后再试');
        }
      }).catch((err) => {
        this.btnLoading = false;
        this.$store.commit('REQUEST_ERROR', { err });
      })
    }
  },
  
  components: { remindDialog }
}
</script>
