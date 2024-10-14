<template>
  <!-- 营销 - 营销分析 -->
  <div class="market-analyze">
    <saas-bread title="营销分析"></saas-bread>
    <Row type="flex" justify="space-between" :gutter="20" class="mb-20">
      <i-col span="12">
        <!-- 概览 -->
        <div class="overview container mb-20">
          <div class="title">
            <span>概览</span>
            <RadioGroup size="small" v-model="formData.p" type="button" @on-change="getCylEtcOrderSync">
              <Radio v-for="(item, index) in overviewRadios" :key="index" :label="item.value">{{ item.label }}</Radio>
            </RadioGroup>
          </div>
          <div class="content" style="padding-top: 20px;">
            <div class="overview-list">
              <div class="overview-item">
                <div class="overview-item__left">
                  <img src="/images/market-analyze/icon_xianshang@2x.png">
                </div>
                <div class="overview-item__right">
                  <h1>{{ overviewData.onlineCount }}单 / ￥{{ overviewData.onlineAmount | toMillesimal }}</h1>
                  <p>线上项目</p>
                </div>
              </div>
              <div class="overview-list">
                <div class="overview-item__left">
                  <img src="/images/market-analyze/icon_pingtai@2x.png">
                </div>
                <div class="overview-item__right">
                  <h1>{{ overviewData.platformCount }}单 / ￥{{ overviewData.platformAmount | toMillesimal }}</h1>
                  <p>平台项目</p>
                </div>
              </div>
            </div>
            <Spin fix v-if="overviewLoading"></Spin>
          </div>
        </div>
        <!-- 项目占比 -->
        <div class="proportion container">
          <div class="title"><span>项目占比</span></div>
          <div class="content pie-content">
            <chart :options="proportionOpts" :auto-resize="true"> </chart>
            <Spin fix v-if="overviewLoading"></Spin>
          </div>
        </div>
      </i-col>
      <i-col span="12">
        <!-- 营销项目TOP10 -->
        <div class="toplist container">
          <div class="title">
            <span>营销项目TOP10</span>
            <!-- <RadioGroup size="small" v-model="formData.a" type="button">
              <Radio label="全部"></Radio>
              <Radio label="线上项目"></Radio>
              <Radio label="平台项目"></Radio>
            </RadioGroup> -->
          </div>
          <div class="content toplist-content">
            <div v-if="!toplist.length" class="no-data">暂无数据</div>
            <div v-else class="toplist-item" v-for="(item, index) in toplist" :key="index">
              <span v-if="index > 2" class="toplist-item__icon">{{index + 1}}</span>
              <img v-else class="toplist-item__icon" :src="`/images/market-analyze/icon_top_${index + 1}@2x.png`">
              <span class="toplist-item__name">{{ item.name }}</span>
              <span class="toplist-item__count">{{ item.orderCount }}单</span>
              <span class="toplist-item__price">¥{{ item.totalAmount | toMillesimal }}</span>
            </div>
            <Spin fix v-if="overviewLoading"></Spin>
          </div>
        </div>
      </i-col>
    </Row>
    <div class="tendency container">
      <div class="title">
        <span>项目趋势</span>
        <RadioGroup size="small" v-model="tendencyFormData.p" type="button" @on-change="getPlatformTendency">
          <Radio v-for="(item, index) in tendencyRadios" :key="index" :label="item.value">{{ item.label }}</Radio>
        </RadioGroup>
      </div>
      <div class="content" style="position: relative;">
        <p class="chart-title">销售额(元)</p>
        <chart :options="tendencyOpts" :auto-resize="true"> </chart>
        <Spin fix v-if="tendencyLoading"></Spin>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        overviewLoading: false,
        formData: {
          p: "yesterday"
        },
        overviewRadios: [
          { label: "昨日", value: "yesterday" },
          { label: "最近7天", value: "seven" },
          { label: "最近30天", value: "thirty" },
          { label: "全部", value: "all" },
        ],
        overviewData: {
          onlineCount: 0,
          onlineAmount: 0,
          platformCount: 0,
          platformAmount: 0,
        },

        toplistLoading: false,
        toplist: [],

        proportionLoading: false,
        proportionOpts: {},

        tendencyLoading: false,
        tendencyFormData: {
          p: "day"
        },
        tendencyRadios: [
          { label: "日", value: "day" },
          { label: "周", value: "week" },
          { label: "月", value: "month" },
        ],
        tendencyOpts: {},
      }
    },
    created () {
      this.getCylEtcOrderSync();
      this.getPlatformTendency();
    },

    methods: {
      async getPlatformTendency () {
        this.tendencyLoading = true;
        let data = await this.$ajax.getPlatformTendency(this.tendencyFormData);
        this.setTendencyOpts({
          xAxis: data.dates,
          yAxis: {
            online: [0, 0, 0, 0, 0, 0, 0],
            platform: data.turnovers
          }
        });
        this.tendencyLoading = false;
      },
      async getCylEtcOrderSync () {
        this.overviewLoading = true;
        let data = await this.$ajax.getCylEtcOrderSync(this.formData);
        this.overviewData = {
          onlineCount: 0,
          onlineAmount: 0,
          platformCount: Number(data.orderCount || 0),
          platformAmount: Number(data.totalAmount || 0),
        };

        this.toplist = data.orderTopDatas;
        this.setProportionOpts(this.overviewData);
        setTimeout(() => {
          this.overviewLoading = false;
        }, 300)
      },

      // 饼图配置
      setProportionOpts (data) {
        let lengend = ["线上项目", "平台项目"];
        let allAmount = data.onlineAmount + data.platformAmount;
        let seriesData = [];
        let onlinePercent = 0;
        let platformPercent = 0;
        if (allAmount != 0) {
          onlinePercent = (data.onlineAmount / allAmount) * 100;
          platformPercent = (data.platformAmount / allAmount) * 100;
        }
        seriesData = [
          { name: lengend[0], value: data.onlineAmount, percent: onlinePercent.toFixed(2) },
          { name: lengend[1], value: data.platformAmount, percent: platformPercent.toFixed(2) },
        ];
        let optData = {
          color: ['#FF8000', '#5F7DED', '#00b7ff'],
          tooltip: {
            trigger: 'item',
            formatter: "{b} : {d}%"
            // formatter: "{b} : 100%"
          },
          legend: {
            orient: "vertical",
            right: 80,
            top: 60,
            itemWidth: 4,
            itemHeight: 4,
            itemGap: 15,
            icon: "circle",
            formatter (name) {
              let data = seriesData.find(elm => elm.name == name) || {};
              return `  ${data.name}  |  ${data.percent}%      ￥${String(data.value).replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => s + ',')}`;
            },
            data: lengend
          },
          series: [{
            name: "库存情况",
            hoverAnimation: false,
            type: "pie",
            radius: 90,
            left: 0,
            center: [130, 90],
            clockwise: false,
            data: seriesData,
            label: {
              normal: { show: false }
            },
            itemStyle: {
              normal: Number(onlinePercent) < 1 || Number(platformPercent) < 1 ? {} : { borderWidth: 1, borderColor: '#ffffff' }
            }
          }],
        }
        this.proportionOpts = optData;
      },

      // 柱状图配置
      setTendencyOpts (data) {
        let optData = {
          color: ['#FF8000', '#5F7DED', '#00b7ff'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            bottom: "0",
            itemWidth: 12,
            itemHeight: 12,
            data: []
          },
          grid: {
            left: '20',
            right: '0',
            bottom: "40",
            top: "20",
            containLabel: true
          },
          xAxis: {
            type: 'category',
            axisLine: {
              lineStyle: {
                color: '#332E29'
              }
            },
            axisTick: {
              show: false
            },
            data: []
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false
            },
            splitLine: {
              lineStyle: {
                color: '#E5E2DF'
              }
            }
          }
        };

        optData.xAxis.data = data.xAxis;
        let lengend = ["线上项目", "平台项目"];
        optData.legend.data = lengend;
        optData.series = [
          {
            name: lengend[0],
            type: 'bar',
            data: data.yAxis.online
          },
          {
            name: lengend[1],
            type: 'bar',
            data: data.yAxis.platform
          }
        ];
        this.tendencyOpts = optData;
      }
    }
  }
</script>

<style lang="less" scoped>
  .market-analyze {
    .container {
      background: white;
      max-width: unset;
    }
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      line-height: 702px;
      height: 70px;
      span {
        font-size: 14px;
        font-family: PingFangSC-Medium,PingFang SC;
        font-weight: 600;
        color: rgba(51,46,41,1);
      }
    }
    .content {
      position: relative;
      padding: 0 20px 20px;
      .chart-title {
        font-size: 12px;
        font-family: PingFangSC-Regular,PingFang SC;
        font-weight: 400;
        color: rgba(128,125,124,1);
        line-height: 18px;
        padding-left: 15px;
      }
      .echarts {
        width: 100%;
      }
      &.pie-content {
        .echarts {
          height: 210px;
        }
      }
    }

    .overview {
      height: 180px;
      &-list {
        display: flex;
        align-items: center;
      }
      &-item {
        width: 50%;
        display: flex;
        align-items: center;
        &__left {
          min-width: 40px;
          width: 40px;
          height: 40px;
          font-size: 0;
          margin-right: 10px;
          img {
            width: 100%;
            height: 100%;
          }
        }

        &__right {
          h1 {
            font-size: 14px;
            font-family: PingFangSC-Semibold,PingFang SC;
            font-weight: 600;
            color: rgba(51,46,41,1);
            line-height: 20px;
          }
          p {
            font-size: 12px;
            font-family: PingFangSC-Regular,PingFang SC;
            font-weight: 400;
            color: rgba(128,125,124,1);
            line-height: 18px;
          }
        }
      }
    }

    .proportion {
      height: 280px;
    }

    .toplist {
      height: 480px;
      .no-data {
        line-height: 200px;
        text-align: center;
      }
      .toplist-item {
        height: 20px;
        line-height: 20px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        &:nth-child(1),
        &:nth-child(2),
        &:nth-child(3) {
          font-size: 14px;
          font-family: PingFangSC-Medium,PingFang SC;
          font-weight: 500;
          color: rgba(51,46,41,1);
        }

        &__icon {
          width: 18px;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          margin-right: 10px;
          color: white;
          font-size: 12px;
          background: #DCDBDA;
          text-align: center;
        }
        &__name {
          margin-right: 10px;
          flex-grow: 1;
        }
        &__count {
          margin-right: 10px;
          width: 90px;
          min-width: 90px;
        }
      }
    }
  }
</style>
