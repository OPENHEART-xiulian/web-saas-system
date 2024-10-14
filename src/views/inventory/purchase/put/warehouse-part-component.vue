<template>
  <!-- 项目信息 -->
  <div style="position: relative" class="part-component">
    <table class="input-list-table">
      <thead class="theader" v-if="formRows.length > 0">
        <tr class="row">
          <th class="col">配件编号</th>
          <th class="col">原厂编码</th>
          <th class="col">名称</th>
          <th class="col">品牌</th>
          <th class="col">单位</th>
          <th class="col" style="width: 100px">仓库</th>
          <th class="col" style="width: 100px">货位</th>
          <th class="col" style="width: 100px">入库数量</th>
          <th class="col" style="width: 100px">配件单价</th>
          <th class="col" style="width: 100px">合计</th>
          <th class="col">零售价</th>
          <!-- <th class="col col-50" v-if="formRows.length > 0"></th> -->
        </tr>
      </thead>
      <tbody class="tbody">
        <template v-if="!loading">
          <tr class="row" v-for="(item, index) in formRows" :key="item.componentId">
            <td class="col">
              <Tooltip v-if="item.partNo" placement="top" :content="item.partNo">{{item.partNo}}</Tooltip>
              <span v-else>--</span>
            </td>
            <td class="col">
              <Tooltip v-if="item.partFactoryNo" placement="top" :content="item.partFactoryNo">{{item.partFactoryNo}}</Tooltip>
              <span v-else>--</span>
            </td>
            <td class="col">
              <Tooltip v-if="item.partName" placement="top" :content="item.partName">{{item.partName}}</Tooltip>
              <span v-else>--</span>
            </td>
            <td class="col">
              <Tooltip v-if="item.brand" placement="top" :content="item.brand">{{item.brand}}</Tooltip>
              <span v-else>--</span>
            </td>
            <td class="col"><my-unit :unit="item.unit"></my-unit></td>
            <!-- 仓库 -->
            <td class="col">
              <c-k-select :data="item" :auto-init="autoInit" :default-list="wteflowList" :index="index" @on-change="ckChange" @default-change="defaultChange"></c-k-select>
            </td>
            <!-- 货位 -->
            <td class="col">
              <Select v-if="formRows[index].shelfList.length > 0" v-model="formRows[index].shelfId">
                <Option v-for="citem in formRows[index].shelfList" :key="citem.shelfId" @click.native="shelfChange(citem, index)" :value="citem.shelfId">{{citem.shelfName}}</Option>
              </Select>
              <span v-else>--</span>
              <!-- <c-k-select :data="item" :index="index" @on-change="ckChange" @default-change="defaultChange"></c-k-select> -->
            </td>
            <!-- 入库数量 -->
            <td class="col">
              <format-input 
                v-model="formRows[index].quantity" 
                :min="1"
                @on-blur="getRowCost(index)" 
                reg="NUMBER"/>
            </td>
            <!-- 配件单价 -->
            <td class="col">
              <format-input v-model="formRows[index].purchasePrice" :min="0.01" @on-blur="getRowCost(index)" reg="PRECISION"/>
            </td>
            <!-- 采购金额 -->
            <td class="col">{{item.cost | toFixed}}</td>
            <!-- 零售价 -->
            <td class="col">
              <span>{{formRows[index].retailPrice}}</span>
              <!-- <format-input v-model="formRows[index].retailPrice" @on-blur="getRowCost(index)" reg="PRECISION"/> -->
            </td>
            <!-- <td class="col col-50" v-if="formRows.length > 0">
              <i class="iconfont icon-shanchu" @click="removeFormRows(index)"></i>
            </td> -->
          </tr>
        </template>
        <tr class="no-data" v-if="formRows.length === 0">
          <td colspan="12">暂无配件信息，请选择配件</td>
        </tr>
      </tbody>
      <tfoot class="tfooter">
        <tr>
          <!-- <td colspan="12">
            <i-button type="primary" @click="openChoose" :loading="loading">选择配件</i-button>
          </td> -->
        </tr>
      </tfoot>
    </table>
    <choose-dialog ref="choose" @choose-success="distinct"></choose-dialog>
  </div>
</template>

<script>
  import '@/styles/components/input-list.less';
  import ChooseDialog from '@/components/dialog/choose-maintain-dialog';
  import CKSelect from './c-k-select.vue';
  import { multiply } from '@/assets/js/utils.js';
  import { unit, getLabel } from '@/store/json/default.js';
  export default {
    components: { ChooseDialog, CKSelect },
    props: {
      autoInit: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        formRows: [],
        wteflowList: [],
        loading: false,
        row: {
          partName: '',             // 配件名称
          partNo: '',               // 配件编号
          brand: '',                // 配件品牌
          quantity: '',             // 配件数量
          retailPrice: '',          // 零售价
          purchasePrice: '',        // 采购价
          cost: '',                 // 配件金额
          shelfList: []
        },
      }
    },
    methods: {
      setDefaultList (to) {
        this.getWteflowList(to);
      },
      async getWteflowList (to) {
        try {
          this.loading = true;
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'wateflowList'
          });

          if (res.code === '0') {
            this.wteflowList = res.data.rows;
            this.initList(to);
          }
          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },
      initList (to) {
        if (!to) return;
        to.forEach(item => {
          item.quantity = item.quantity || '0';
          item.retailPrice = item.retailPrice || '0';
          item.purchasePrice = item.purchasePrice || '0';
          const cost = multiply(item.quantity, item.purchasePrice );
          item.cost = String(cost);
          item.shelfList = item.shelfList || [];
        });
        this.formRows = JSON.parse(JSON.stringify(to));
        this.getSum();
      },
      getSum () {
        let sum = 0;
        let count = 0;
        this.formRows.forEach( item => {
          sum += parseFloat(item.cost || '0');
          count += parseFloat(item.quantity || 0);
        });
        this.$emit('on-change', parseFloat(sum.toFixed(2)), parseFloat(count.toFixed(2)), this.formRows.length);
      },
      removeFormRows (index) {
        if (this.formRows.lenght <= 1) return;
        this.formRows.splice(index, 1);
        this.getSum();
      },
      getRowCost (index, type) {
        const item = this.formRows[index];
        const quantity = item.quantity || '1';
        const purchasePrice = item.purchasePrice || '0';
        const cost = multiply(quantity, purchasePrice);
        this.formRows[index].cost = String(cost);
        this.getSum();
      },
      openChoose () {
        let formRows = JSON.parse(JSON.stringify(this.formRows));
        formRows.forEach( item => {
          item.quantity = item.originQuantity;
          delete item.originQuantity;
        })
        this.$refs.choose.openModel(formRows);
      },
      distinct (array) {
        array.forEach((item, index) => {
          item.originQuantity = item.quantity || '0';
          item.quantity = '1';
          // 这一步为了让已经选择过的配件不做修改
          this.formRows.forEach((citem, cindex) => {
            if (citem.partNo === item.partNo) {
              item.quantity = citem.quantity;
              item.retailPrice = citem.retailPrice;
              item.shelfList = citem.shelfList;
              item.shelfId = citem.shelfId || citem.shelfList[0].shelfId;
              item.shelfName = citem.shelfName || citem.shelfList[0].shelfName;
            }
          })
        })
        this.initList(array);
      },
      getFormRows () {
        let data = JSON.parse(JSON.stringify(this.formRows));
        data.forEach(item => {
          if (item.shelfList) delete item.shelfList;
          item.quantity = String(parseFloat(item.quantity));
          item.originQuantity = String(parseFloat(item.originQuantity));
          item.purchasePrice = String(parseFloat(item.purchasePrice));
          item.retailPrice = String(parseFloat(item.retailPrice));
          item.cost = String(parseFloat(item.cost));
        })
        return data;
      },
      shelfChange (data, index) {
        this.formRows[index].shelfId = data.shelfId || '';
        this.formRows[index].shelfName = data.shelfName || '';
      },
      ckChange (data, index) {
        this.formRows[index].warehouseId = data.warehouseId;
        this.formRows[index].warehouseName = data.warehouseName;
        // 货位默认第一个
        this.formRows[index].shelfList = data.shelves;
        this.formRows[index].shelfId = data.shelves.length !== 0 ? data.shelves[0].shelfId : '';
        this.formRows[index].shelfName = data.shelves.length !== 0 ? data.shelves[0].shelfName : '';
      },
      defaultChange (data, index) {
        this.formRows[index].warehouseId = data.warehouseId;
        this.formRows[index].warehouseName = data.warehouseName;
        this.formRows[index].shelfList = data.shelves;
        this.formRows[index].shelfId = data.shelfId;
        this.formRows[index].shelfName = data.shelfName;
        this.formRows = JSON.parse(JSON.stringify(this.formRows));
      }
    },
    filters: {
      getUnit (v) {
        return getLabel(v, unit);
      },
      toFixed (v) {
        return v ? Number(v).toFixed(2) : 0;
      }
    }
  }
</script>
