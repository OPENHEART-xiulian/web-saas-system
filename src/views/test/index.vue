<template>
  <div>
    <saas-bread title="测试列表"></saas-bread>
    <saas-table 
      api="getPurchasePutList"
      :columns="columns">
    </saas-table>
  </div>
</template>

<script>
  // components
  export default {
    data () {
      let columns = [
        { title: "序号", type: "index", width: 80, fixed: true },
        { title: "单号", key: "purchaseCode" },
        { title: "供应商", key: "supplierName" },
        { title: "采购数量", key: "totalQuantity" },
        { title: "采购人", key: "operatedBy" },
      ];
      return {
        columns
      }
    },

    created () {
      this.$ajax.getStudenNo();
    }
  }
</script>
