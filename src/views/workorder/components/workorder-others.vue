<template>
  <!-- 项目信息 -->
  <table class="input-list-table">
    <thead class="theader" v-if="formRows.length > 0">
      <tr class="row">
        <th class="col">项目</th>
        <th class="col col-300">金额 (元)</th>
        <th class="col col-50" v-if="formRows.length > 0"></th>
      </tr>
    </thead>
    <tbody class="tbody">
      <tr class="row" v-for="(item, index) in formRows" :key="index">
        <td class="col">
          <i-input v-model="formRows[index].name" @on-blur="getSum" placeholder=""></i-input>
        </td>
        <td class="col col-300">
          <format-input v-model="formRows[index].cost" @on-blur="getSum" reg="PRECISION" placeholder=""></format-input>
        </td>
        <td class="col col-50" v-if="formRows.length > 0">
          <i class="iconfont icon-shanchu" @click="removeFormRows(index)"></i>
        </td>
      </tr>
      <tr class="no-data" v-if="formRows.length === 0">
        <td colspan="8">暂无其他费用信息，请添加其他费用信息</td>
      </tr>
    </tbody>
    <tfoot class="tfooter">
      <tr>
        <td colspan="3">
          <i-button type="primary" @click="addFormRows">
            <!-- <i class="iconfont icon-xinzeng"></i> -->
            新增费用
          </i-button>
        </td>
      </tr>
    </tfoot>

  </table>
</template>

<script>
  import mixins from './mixins.js';
  export default {
    mixins: [mixins],
    data () {
      return {
        formRows: [],
        row: {
          name: '',
          cost: ''
        }
      }
    },
    methods: {
      initList (to) {
        this.formRows = to;
        // if (this.formRows.length === 0) this.formRows = [{}]
      },
      getSum () {
        let sum = 0;
        this.formRows.forEach( item => {
          if (item.name) sum += parseFloat(item.cost || '0');
        });
        this.$emit('on-change', sum);
      },
      getFormRows () {
        let data = [];
        this.formRows.forEach( item => {
          if (!item.cost) {
            item.cost = '0';
          }
          if (item.name && item.name !== '') data.push(item);
        })
        return data;
      },
    }
  }
</script>
