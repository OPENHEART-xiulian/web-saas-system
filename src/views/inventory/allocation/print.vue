<template>
	<!-- 打印模板 -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area" ref="printForm">
          <h2 class="title">调拨单</h2>
          <p class="statement-no">调拨单号：{{detailData.allotCode || '--'}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;打印时间：{{time || '--'}}</p>
          <div class="print-form">
            <table>
              <tr>
                <td style="width: 76px;">调拨人</td>
                <td>{{detailData.operatedBy || '--'}}</td>
                <td>制单人</td>
                <td>{{detailData.createdBy || '--'}}</td>
                <td>开单时间</td>
                <td>{{detailData.createdAt && formatTime(detailData.createdAt, 'yyyy-MM-dd') || '--'}}</td>
                <td>完成时间</td>
                <td>{{detailData.finishedAt && formatTime(detailData.finishedAt, 'yyyy-MM-dd') || '--'}}</td>
              </tr>
              <tr>
                <td>备注</td>
                <td colspan="7">{{detailData.remark || '--'}}</td>
              </tr>
              <!-- 为了兼容样式最后一行的border -->
              <tr></tr>
            <!-- </table>

            <table> -->
              <tr>
                <td>调拨信息</td>
                <!-- <td style="width: 76px;" :rowspan="detailData.components ? (detailData.components.length > 1 ? detailData.components.length+1 : 2) : 2">调拨信息</td> -->
                <td class="no-padding" colspan="7">
                  <table>
                    <tr class="no-border">
                      <td style="width: 80px;">配件名称</td>
                      <td style="width: 90px;">原厂编码</td>
                      <td style="width: 90px;">调出仓库</td>
                      <td style="width: 90px;">调出货位</td>
                      <td style="width: 80px">调出数量</td>
                      <td style="width: 70px">调入仓库</td>
                      <td style="width: 90px">调入货位</td>
                    </tr>
                    <tr class="no-border" v-if="!detailData.components || detailData.components.length==0">
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr class="no-border" v-for="(item,index) in detailData.components" :key="index">
                      <td>{{item.partName || '--'}}</td>
                      <td>{{item.partFactoryNo || '--'}}</td>
                      <td>{{item.allotOut.warehouseName || '--'}}</td>
                      <td>{{item.allotOut.shelfName || '--'}}</td>
                      <td>{{item.quantity || '0'}}</td>
                      <td>{{item.allotIn.warehouseName || '--'}}</td>
                      <td>{{item.allotIn.shelfName || '--'}}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>调仓总数</td>
                <td colspan="7">{{detailData.totalQuantity}}件</td>
              </tr>
              <!-- 为了兼容样式最后一行的border -->
              <tr></tr> 
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-btn">
      <div>
        <i-button type="default" @click.stop="closePrint">取消</i-button>
        <i-button type="primary" @click.stop="print">打印</i-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Print from '@/assets/js/print.js';
import { formatTime } from '@/assets/js/utils';
import '@/../public/css/print.css';

export default {
  data () {
    return {
      formatTime,
      show: false,
      time: formatTime(new Date(), 'yyyy-MM-dd')
    }
  },

  computed: {
    ...mapGetters({
      detailData: 'getAllocationDetail'
    })
  },

  methods: {
    openPrint (id,shareStoreId) {
      this.$store.dispatch({
        type: 'toGetAllocationDetail',
        params: {
          _id: id,
          shareStoreId:shareStoreId
        }
      })

      this.show = true;
    },

    closePrint () {
      this.show = false;
    },

    print () {
      const newPrint = new Print(this.$refs.printForm, '/css/print.css');
    },
  }
}
</script>
