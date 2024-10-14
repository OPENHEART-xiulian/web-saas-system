<template>
  <!-- 供应商列表 -->
  <div>
    <saas-bread title="供应商">
      <template slot="actions">
        <div class="flex ac" >
          <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
          <Button v-if="permissionData.create" to="/inventory/supplier/add/create" type="error">
            <i class="iconfont icon-xinzeng left-icon"></i>
            <span>新建供应商</span>
          </Button>
          <saas-store-select v-model="isSelfStore" @on-change="changeStore"/>
        </div>
      </template>
    </saas-bread>

    <!-- 筛选表格 -->
    <saas-query-table
      ref="table"
      api="getSupplierList"
      query-class="column-3"
      :query-show="queryShow" 
      :query-data="inputData"
      :defaultParams="params"
      :columns="columns">
    </saas-query-table>
  </div>
</template>

<script>
import supplierInputs from "@/commons/inputs/supplier-input";       // 筛选的列 -> 供应商

import commonColumns from "@/commons/columns/common-column";        // 表格的列 -> 公共 
import partColumns from "@/commons/columns/part-column";            // 表格的列 -> 配件
import supplierColumns from "@/commons/columns/supplier-column";    // 表格的列 -> 供应商

export default {
  data () {
    let permissionData = this.$permission.data.inventorySupplier;
    let columns = [
      commonColumns.index(),                                        // 序号
      supplierColumns.supplierCode(),                               // 供应商编号
      supplierColumns.supplierName({ title: "名称" }),              // 供应商名称
      supplierColumns.supplierContact(),                            // 联系人
      supplierColumns.supplierTel(),                                // 联系电话
      supplierColumns.purchaseCount(),                              // 采购次数
      supplierColumns.toSettle(),                                   // 待结账款
      supplierColumns.lastPurchaseAt(),                             // 最后采购时间
      { 
        title: '操作',
        width: 80,
        align: "center",
        fixed: "right",
        render: (h, { row }) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text',
                to: '/inventory/supplier/detail/' + row.supplierId+"?shareStoreId="+this.params.shareStoreId+"&isSelfStore="+this.isSelfStore
              },
            }, '查看')
          ]);
        }
      }
    ];
    if (!permissionData.check) columns.pop();
    return {
      queryShow: false,
      permissionData,
      inputData: [
        supplierInputs.supplierCode(),                     // 供应商编码
        supplierInputs.supplierName(),                     // 供应商名称
        supplierInputs.contact(),                          // 联系人姓名
        supplierInputs.purchaseCount(),                    // 采购次数
        supplierInputs.toSettle(),                         // 待结账款
      ],
      columns,
      params:{
        shareStoreId:''
      },
      isSelfStore:true
    }
  },
  methods: {
    changeStore(id){
      this.params.shareStoreId = id
      this.$refs.table.init()
    },
  },
}
</script>
