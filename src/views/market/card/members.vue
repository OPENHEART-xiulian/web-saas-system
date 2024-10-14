<template>
  <div class="components-list-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>名称</th>
          <th>简介</th>
          <th>类型</th>
          <th>有效期</th>
          <!-- <th>卡片余量</th> -->
          <th>售价</th>
          <th>面额</th>
        </tr>
      </thead>
      <tbody>
        <tr class="no-data" v-if="!list.length">
          <td colspan="6" class="center">暂无会员卡信息，请选择会员卡</td>
        </tr>
        <tr v-for="(item, index) in list" :key="index">
          <td>
            <span>{{item.name || '--'}}</span>
          </td>
          <td>
            <span>{{item.remark || '--'}}</span>
          </td>
          <td>
            <span>{{getLabel(item.type, memberCardType)}}</span>
          </td>
          <td>
            <span>{{getPeriodValidityt}}</span>
          </td>
          <!-- <td>
            <span>{{item.cardCount || '不限数量'}}</span>
          </td> -->
          <td>
            <span>{{item.salePrice || 0}}</span>
          </td>
          <td>
            <format-input v-model="list[index].amount" :min="0" v-if="!disabled"></format-input>
            <span v-else>{{item.amount}}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="btn-wrap" v-if="!disabled">
      <i-button type="primary" @click="openDialog">{{list.length ? '重新选择' : '选择会员卡'}}</i-button>
    </div>
    <card-dialog v-if="!disabled" ref="choose" @choose-success="distinct"></card-dialog>
  </div>
</template>

<script>
  import '@/styles/views/market/list-component.less';
  import { formatTime } from '@/assets/js/utils';
  import CardDialog from '@/components/dialog/choose-card-dialog';
  import { memberCardType, memberCardExpiryType, memberCardCoverType, getLabel } from '@/store/json/default';
  export default {
    components: { CardDialog },
    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      value: {
        type: Array
      }
    },
    data () {
      return {
        memberCardType, 
        memberCardExpiryType, 
        memberCardCoverType, 
        getLabel,
        list: []
      }
    },

    computed: {
      getPeriodValidityt () {
        const data = this.list[0];
        if (data.expiryType === '0') {
          return '永久有效';
        } else if (data.expiryType === '1') {
          return data.expiryDays + '天';
        } else {
          let str = formatTime(data.expiryFrom, 'yyyy-MM-dd') + ' 到 ' + formatTime(data.expiryTo, 'yyyy-MM-dd');
        }
      },
    },

    watch: {
      value (data) {
        this.list = data;
      }
    },

    methods: {
      openDialog () {
        const data = JSON.parse(JSON.stringify(this.list[0] || {}));
        this.$refs.choose.openModel(data);  
      },

      distinct (data) {
        if (!data._id) return;
        this.list = [data];
        this.onChange();
      },

      onChange () {
        this.$emit('on-change', this.list[0]);
      }
    }
  }
</script>
