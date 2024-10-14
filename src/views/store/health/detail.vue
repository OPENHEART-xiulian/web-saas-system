<template>
  <div class="workorder-detail">
    <saas-bread title="上传记录详情">
      <template slot="actions">
        <Button type="default" @click="$router.go(-1)">返回</Button>
        <!-- <Button type="error" @click="openPrint">打印</Button> -->
      </template>
    </saas-bread>
    <div class="top-wrap">
      <div class="row">
        <span class="col">企业名称：{{ workDetail.companyName }}</span>
        <span class="col">工单号：{{ workDetail.statementNo }}</span>
        <span class="col">车牌号码：{{ workDetail.plateNo }}</span>
        <span class="col">车辆识别代号：{{ workDetail.VINCode }}</span>
      </div>
      <div class="row">
        <span class="col">送修里程：{{ workDetail.deliveryMileage || '--' }}KM</span>
        <span class="col">送修日期：{{ workDetail.deliveryDate | formatTime }}</span>
        <span class="col w-50" v-if="workDetail.settlementDate">结算时间：{{ workDetail.settlementDate | formatDate }}</span>
      </div>
    </div>

    <div class="content">
      <h4 class="title">项目信息</h4>
      <Table class="project-table" no-data-text="暂无项目信息" 
        :columns="projectColumns" 
        :data="workDetail && workDetail.repairItems">
      </Table>
    </div>
    <div class="content">
      <h4 class="title">配件信息</h4>
      <Table class="m-table" no-data-text="暂无配件信息" 
        :columns="partsColumns" 
        :data="workDetail && workDetail.repairParts">
      </Table>
    </div>
    <Spin fix v-if="loading"></Spin>
    <!-- <print ref="print"></print> -->
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
// import print from './print';
import { formatTime } from '@/assets/js/utils.js';
import '@/styles/views/workorder/detail.less';

export default {
  data () {
    return {
      projectColumns: [
        { title: '序号', type: 'index', wdith: 70 },
        { title: '维修项目', key: 'name' },
        { 
          title: '维修工时', 
          key: 'hours',
          render: (h, { row }) => {
            return h('div', row.hours || '--');
          } 
        }
      ],
      partsColumns: [
        { title: '序号', type: 'index' },
        { 
          title: '配件名称', 
          key: 'partName',
          render: (h, { row }) => {
            return h('div', row.partName || row.name || '--');
          }
        },
        { title: '配件编号', key: 'partNo' },
        { title: '数量', key: 'quantity' },
      ]
    }
  },

  created () {
    this.$store.dispatch({
      type: "toGetErecordDetail",
      params: {
        id: this.$route.params.id
      }
    });
  },

  methods: {
    openPrint () {
      this.$refs.print.openPrint(this.workDetail);
    }
  },

  computed: {
    ...mapGetters({
      workDetail: 'getWorkDetail'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  filters: {
    formatTime (time) {
      if (!time) return '--';
      return formatTime(time, 'yyyy-MM-dd');
    },
    formatDate (date) {
      if (!date) return '--';
      return formatTime(date, 'yyyy-MM-dd HH:mm:ss');
    }
  },
}
</script>

<style lang="less" scoped>
  /deep/ .project-table {
    .ivu-table colgroup {
      >:first-child {
        width: 70px;
      }
      >:nth-child(2) {
        width: auto;
      }
      >:last-child {
        width: 25%!important;
        max-width: initial;
        >.ivu-table-cell>div {
          white-space: nowrap;
        }
      }
    }
    
    .ivu-table tr {
      >:last-child .ivu-table-cell {
        padding-left: 0;
      }
    }
  }

  /deep/ .m-table {
    .ivu-table colgroup {
      >:first-child {
        width: 70px;
      }
      >:nth-child(2) {
        width: auto;
      }
      >:nth-child(3),
      >:last-child {
        width: 25%!important;
        max-width: initial;
        >.ivu-table-cell>div {
          white-space: nowrap;
        }
      }
    }
    .ivu-table tr {
      >:nth-child(3) .ivu-table-cell,
      >:last-child .ivu-table-cell {
        padding-left: 0;
      }
    }
  }
  
  .top-wrap {
    padding: 20px;
    background: white;
    box-shadow: 0 2px 4px 0 rgba(51, 46, 41, 0.05);
    font-size: 14px;
    color: #332e29;
    margin-bottom: 10px;
  }

  .top-wrap .row {
    display: flex;
    line-height: 30px;
  }

  .top-wrap .row .col {
    width: 25%;
    color: #332e29;
    font-size: 14px;
    white-space: nowrap;
  }
  .top-wrap .row .col.w-50 {
    width: 50%;
  }

  .content .title {
    margin-bottom: 12px;
    padding: 12px 20px;
    background: #FCFBFA;
    font-weight: normal;
  }

  .content {
    padding-bottom: 20px;
  }
</style>
