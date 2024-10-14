<template>
  <div class="recharge-record">
    <saas-bread title="充值记录">
      <template slot="actions">
        <Button type="default" @click="$router.go(-1)">返回</Button>
      </template>
    </saas-bread>

    <w-table
      ref="table"
      request="assetRechargeQuery"
      :columns="columns"
      :tableData="tableData">
    </w-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { payType, getObj } from '@/store/json/default';

export default {
  data () {
    return {
      columns: [
        { title: '序号', type: 'index', width: 65 },
        { title: '充值单号', key: 'no' },
        { 
          title: '支付方式', 
          key: 'payType',
          render: (h, { row }) => {
            return h('div', getObj(payType)[row.payType]);
          } 
        },
        { title: '充值金额', key: 'money' },
        { title: '账号小计', key: 'assetTotal' },
        { title: '采购时间', key: 'createdAt' }
      ]
    }
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },
}
</script>
