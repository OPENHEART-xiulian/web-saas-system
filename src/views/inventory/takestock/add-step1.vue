<template>
  <div class="add-step-1">
    <div class="select-table">
      <div class="title">已选配件 ({{tableData.length}})</div>
      <table>
        <thead>
          <tr>
            <th 
              v-for="(item, index) in headers" 
              :key="index" 
              v-if="item.show"
              :style="{
                width: item.width ? (item.width + 'px') : 'normal',
                textAlign: item.align || 'left',
                textIndent: '20px'
              }">{{item.title}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in tableData" :key="index">
            <td>{{index + 1}}</td>
            <td>{{item['partNo']}}</td>
            <td>{{item['partFactoryNo']}}</td>
            <td>{{item['partName']}}</td>
            <td>{{item['brand'] || '--'}}</td>
            <td><my-unit :unit="item.unit"></my-unit></td>
            <td>{{item['cateStr'] && item['cateStr'].split('/').pop() || '--' }}</td>
            <td v-if="!isCreate">{{warehouseName}}</td>
            <td v-if="!isCreate">{{item.shelfName}}</td>
            <td>{{!isCreate?item.realTimeQuantity:item['quantity']}}</td>
            <td><i-input-number v-model="item['incQuantity']" :min="0"></i-input-number></td>
            <td v-if="tableData.length > 1"><i class="iconfont icon-shanchu" @click="removeRows(index)"></i></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="other-msg">
      <div class="title">其他信息</div>
      <div class="content">
        <i-input type="textarea" v-model="remark" :rows="3" @on-blur="blur" placeholder="输入备注说明"></i-input>
      </div>
    </div>
  </div>
</template>

<script>
  import { getChildrenLabel, getLabel, unit } from '@/store/json/default.js';
  export default {
    props: {
      tableData: {
        type: Array
      },
      warehouseName: {
        type: String
      }
    },
    data () {
      const isCreate = this.$route.params.id === 'create';
      return {
        isCreate:isCreate,
        remark: '',
        headers: [

        ],
        heardersCreated:[
          { title: '序号', type: 'index', width: 100, show: true },
          { title: '配件编号', show: true, width: 120 },
          { title: '原厂编码', show: true, width: 120 },
          { title: '配件名称', show: true },
          { title: '配件品牌', show: true },
          { title: '单位', show: true, width: 60 },
          { title: '分类', show: true },
          { title: '现有库存', width: 120, show: true },
          { title: '盘点库存', width: 120, show: true },
          { title: '', width: 60, show: this.tableData.length > 1 }
        ],
        heardersInited:[
          { title: '序号', type: 'index', width: 100, show: true },
          { title: '配件编号', show: true, width: 120 },
          { title: '原厂编码', show: true, width: 120 },
          { title: '配件名称', show: true },
          { title: '配件品牌', show: true },
          { title: '单位', show: true, width: 60 },
          { title: '分类', show: true },
          { title: '仓库', show: true },
          { title: '货位', show: true },
          { title: '现有库存', width: 120, show: true },
          { title: '盘点库存', width: 120, show: true },
          { title: '', width: 60, show: this.tableData.length > 1 }
        ],
        formRows: []
      }
    },
    mounted () {
      if(this.isCreate){
        this.headers = this.heardersCreated
      }else{
        this.headers = this.heardersInited
      }
    },
    methods: {
      blur () {

      },
      getFormData () {
        let data = [];
        this.tableData.forEach(item => {
          data.push({ 
            componentId: item.componentId,
            partNo: item.partNo, 
            partName: item.partName,
            brand: item.brand,
            unit: item.unit,
            originQuantity: String(item.quantity || item.originQuantity || 0),
            incQuantity: String(item.incQuantity || 0),
            purchasePrice: String(item.purchasePrice || 0),
            retailPrice: String(item.retailPrice || 0),
            imgIds: item.imgIds || [],
            code: item.code,
            cateStr: item.cateStr
          });
        });
        return { remark: this.remark, items: data };
      },
      removeRows (index) {
        this.tableData.splice(index, 1);
        this.$parent.setSelectData(this.tableData);
      }
    },
    filters: {
      getLabel (v) {
        return getLabel(v, unit);
      },
      getChildrenLabel
    }
  }
</script>
