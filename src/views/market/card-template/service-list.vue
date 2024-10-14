<template>
  <div class="components-list-wrap">
    <table class="table">
      <thead>
        <tr>
          <th class="center" style="width: 80px;">序号</th>
          <th style="width: 180px">项目名称</th>
          <th style="width: 140px">数量</th>
          <th>单价</th>
          <th style="width: 100px"></th>
        </tr>
      </thead>
      <tbody>
        <tr class="no-data" v-if="!list.length">
          <td colspan="5" class="center">请选择服务项目</td>
        </tr>
        <tr v-for="(item, index) in list" :key="index">
          <td class="center">
            <span>{{index + 1}}</span>
          </td>
          <td>
            <span>{{item.serviceName}}</span>
          </td>
          <td>
              <!-- reg="PRECISION" -->
            <format-input v-model="list[index].count" :min="1" :max="99999" @on-blur="onChange" reg="NUMBER"></format-input>
          </td>
          <td>
            <span>{{item.cost || 0}}</span>
          </td>
          <td class="right">
            <span class="del-btn"><i class="iconfont icon-shanchu" @click="removeRow(index)"></i></span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="btn-wrap">
      <i-button type="primary" @click="openDialog">选择项目</i-button>
    </div>
    <choose-dialog ref="choose" @choose-success="distinct"></choose-dialog>
  </div>
</template>

<script>
  import '@/styles/views/market/list-component.less';
  import chooseDialog from '@/components/dialog/choose-service-dialog';
  export default {
    components: { chooseDialog },
    props: {
      value: {
        type: Array
      }
    },
    data () {
      return {
        list: [],
      }
    },
    watch: {
      value (to) {
        this.list = to;
      },
    },
    methods: {
      openDialog () {
        const list = JSON.parse(JSON.stringify(this.list));
        this.$refs.choose.openModal(list);
      },

      distinct (data) {
        let list = [];
        data.forEach(elm => {
          elm.count = elm.count || 1;
          let data = elm;
          if (this.list.length) {
            this.list.forEach(elm2 => {
              if (elm.serviceId === elm2.serviceId) {
                data = elm2;
              }
            });
          }
          list.push(elm);
        });
        this.list = list;
        this.onChange();
      },

      removeRow (index) {
        this.list.splice(index, 1);
        this.onChange();
      },

      onChange () {
        let list = JSON.parse(JSON.stringify(this.list));
        let formList = list.map(elm => {
          return {
            serviceId: elm.serviceId,
            count: elm.count
          }
        });
        this.$emit('input', list);
        this.$emit('on-change', list);
      }
    }
  }
</script>
