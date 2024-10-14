<template>
  <!-- 项目信息 -->
  <div style="position: relative" class="part-component">
    <table class="input-list-table">
      <thead class="theader" v-if="formRows.length > 0">
        <tr class="row">
          <th class="col">序号</th>
          <th class="col">配件名称</th>
          <th class="col">调出仓库</th>
          <!-- <th class="col">调出货位</th> -->
          <th class="col">可调数量</th>
          <th class="col" style="width: 140px">数量</th>
          <th class="col" style="width: 140px" v-if="allotType==='1'">单价</th>
          <th class="col" style="width: 140px" v-if="allotType==='1'">金额</th>
          <!-- <th class="col col-50" v-if="formRows.length > 0"></th> -->
        </tr>
      </thead>
      <tbody class="tbody">
        <template v-if="!loading">
          <tr class="row" v-for="(item, index) in formRows" :key="item.uniqueId">
            <!-- 序号 -->
            <td class="col">{{index + 1}}</td>
            <!-- 配件名称 -->
            <td class="col">
              <span>{{item.partName}}</span>
            </td>
            <!-- 调出仓库 -->
            <td class="col">
              <i-select v-model="item.allotOut.warehouseId">
                <i-option 
                  v-for="(citem, cindex) in warehouseList" 
                  :key="cindex" 
                  :value="citem.warehouseId"
                  @click.native="onShelfChange(citem, index)">
                  {{citem.warehouseName}}
                </i-option>
              </i-select>
            </td>
            <!-- 调出货位 -->
            <!-- <td class="col">
              <span>{{item.allotOut.shelfName || '--'}}</span>
            </td> -->
            <!-- 可调数量 -->
            <td class="col">
              <span>{{item.originQuantity}}</span>
            </td>
            <!-- 数量 -->
            <td class="col">
                <!-- @on-blur="getRowCost(index)"  -->
              <span v-if="allotType==='1'">{{item.quantity}}</span>
              <format-input v-else v-model="item.quantity" :min="0" :max="item.originQuantity" reg="PRECISION"/>
            </td>
            <!-- 单价 -->
            <td class="col" v-if="allotType==='1'">
              <format-input v-model="item.purchasePrice" :min="0" @on-blur="getRowCost(index)" reg="PRECISION"/>
            </td>
            <!-- 金额 -->
            <td class="col" v-if="allotType==='1'"> 
              <span>{{item.cost}}</span>
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
          <td colspan="12" v-show="isCommon">
            <i-button type="primary" :loading="loading" @click="openChoose">选择配件</i-button>
          </td>
        </tr>
      </tfoot>
    </table>
    <choose-dialog ref="choose" @choose-success="formatting" ></choose-dialog>
  </div>
</template>

<script>
  import '@/styles/components/input-list.less';
  import ChooseDialog from '@/components/dialog/choose-allocation-dialog';
  
  import { multiply } from '@/assets/js/utils.js';
  export default {
    components: { ChooseDialog },
    props:{
      allotType:{
        type: String,
        default:'0'
      },
      isCommon:{
        type: Boolean,
        default:true
      }
    },
    data () {
      return {
        loading: false,
        formRows: [],
        warehouseList: []
      }
    },
    created () {
      this.getWarehouseList();
    },
    methods: {
      getRows(){
        return this.formRows
      },
      getRowCost (index, type) {
        const item = this.formRows[index];
        console.log(item)
        const quantity = Number(item.quantity) || 1;
        const purchasePrice = Number(item.purchasePrice) || 0;
        item.cost = multiply(purchasePrice ,quantity);
        this.$forceUpdate()
      },
      setDefaultList (array) {
        array.forEach(elm => {
          let wareItem = this.warehouseList.find(item => item.warehouseId === elm.allotOut.warehouseId);
          if(!wareItem){
            wareItem = this.warehouseList[0]
            elm.allotOut.warehouseId = this.warehouseList.find(item => item.isDefault === '1').warehouseId;
          }

          elm.shelfList = wareItem.shelves || [];
          elm.cost = multiply(elm.retailPrice ,elm.quantity)
        });
        this.formRows = array;
        this.onChange();
      },
      async getWarehouseList () {
        console.log('getWarehouseList')
        this.loading = true;
        try {
          const res = await this.$store.dispatch({
            type: "actionGet",
            name: "warehouseList"
          });
          if (res.code === '0') this.warehouseList = res.data.rows;
          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },

      onChange () {
        let quantity = 0; // 总数量
        this.formRows.forEach(elm => {
          quantity += Number(elm.quantity);
        });
        let formRows = JSON.parse(JSON.stringify(this.formRows));
        this.$emit("on-change", formRows, quantity);
      },

      onWareChange (data, index) {
        this.formRows[index].allotIn.warehouseId = data.warehouseId;
        this.formRows[index].allotIn.warehouseName = data.warehouseName;
        let shelfItem = data.shelves[0] || {};
        this.formRows[index].allotIn.shelfId = shelfItem.shelfId || '';
        this.formRows[index].allotIn.shelfName = shelfItem.shelfName || '';
        this.$set(this.formRows[index], "shelfList", data.shelves || []);
        this.onChange();
      },

      onShelfChange (data, index) {
        this.formRows[index].allotIn.shelfId = data.shelfId;
        this.formRows[index].allotIn.shelfName = data.shelfName;
        this.onChange();
      },

      removeFormRows (index) {
        this.formRows.splice(index, 1);
        this.onChange();
      },

      openChoose () {
        let formRows = [];
        this.formRows.forEach(item => {
          let newItem = {};
          newItem.uniqueId = item.uniqueId;
          newItem.componentId = item.componentId;
          newItem.partNo = item.partNo;
          newItem.partFactoryNo = item.partFactoryNo;
          newItem.partName = item.partName;
          newItem.quantity = item.originQuantity;
          newItem.warehouseId = item.allotOut.warehouseId;
          newItem.warehouseName = item.allotOut.warehouseName;
          newItem.shelfId = item.allotOut.shelfId;
          newItem.shelfName = item.allotOut.shelfName;
          formRows.push(newItem);
        });
        this.$refs.choose.openModal(formRows);
      },

      formatting (array) {
        console.log(array)
        let newArray = [];
        array.forEach((item, index) => {
          let newItem = {};
          newItem.uniqueId = item.uniqueId;
          newItem.componentId = item.componentId;
          newItem.partNo = item.partNo;
          newItem.partFactoryNo = item.partFactoryNo;
          newItem.partName = item.partName;
          newItem.originQuantity = item.quantity || 0;
          newItem.quantity = item.quantity >= 1 ? 1 : (item.quantity > 0 ? 0.01 : 0);
          newItem.allotOut = {
            warehouseId: item.warehouseId,
            warehouseName: item.warehouseName,
            shelfId: item.shelfId,
            shelfName: item.shelfName
          };
          let wareItem = this.warehouseList[0];
          let shelfItem = wareItem.shelves[0] || {};
          newItem.shelfList = wareItem.shelves;
          newItem.allotIn = {
            warehouseId: wareItem.warehouseId,
            warehouseName: wareItem.warehouseName,
            shelfId: shelfItem.shelfId || '',
            shelfName: shelfItem.shelfName || ''
          };
          // // 这一步为了让已经选择过的配件不做修改
          this.formRows.forEach((citem, cindex) => {
            if (item.uniqueId === citem.uniqueId) {
              newItem.quantity = citem.quantity;
              newItem.allotOut = citem.allotOut;
              newItem.allotIn = citem.allotIn;
            }
          });
          newArray.push(newItem);
        });
        this.formRows = newArray;
        this.onChange();
      }
    }
  }
</script>
