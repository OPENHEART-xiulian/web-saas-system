<template>
  <div class="index-wrap">
    <ul class="two-parts ">
      <li>
        <div class=" three-parts second_row first_row">
          <li>
            <div class="user_info">
              <div class="top">
                <!-- return h('my-img', {
                    props: {
                      src: row.imgIds && row.imgIds[0] ? getUri('checkImg') + row.imgIds[0] : ''
                    },
                    style: {
                      width: '40px',
                      height: '40px'
                    }
                  }); -->
                <img
                  :src="user.avatar?getUri('checkImg')+user.avatar:require('@/assets/images/icon/avatar.png')"
                  class="left"
                />
                <div class="right">
                  <p>{{timeSection}}好，{{user.username}}</p>
                  <p >{{user.roleName==='店长'?'店长':user.jobTitle || '--'}}</p>
                </div>
              </div>
              <ul class="bottom">
                <li @click="goMyPerfomance">
                  <img src="@/assets/images/icon/value.png" alt="">
                  <p>我的产值</p>
                </li>
                <li>
                  <img src="@/assets/images/icon/more.png" alt="">
                  <p>敬请期待</p>
                </li>
              </ul>
            </div>

          </li>
          <li>
            <div class="speedy_enter">
              <div class="title">
                <span>便捷入口</span>
                <span @click="showSpeedModal" class="more">更多</span>
              </div>
              <ul class="speedy_item">
                <li
                  v-for="item in speedSelectedArr"
                  :key="item._id"
                  @click="goShortCutPath(item.code)"
                >
                  <span v-if="String(item.code)==='0001' && Number(user.birthdayRemindCount)>0" class="tipsNum">{{user.birthdayRemindCount}}</span>
                  <my-img
                    :src="getUri('checkImg')+item.imgId"
                    class="top"
                  ></my-img>
                  <p class="bottom">{{item.name}}</p>
                </li>
              </ul>
            </div>

          </li>
        </div>

      </li>

      <li>
        <Carousel
          autoplay
          :autoplay-speed="5000"
          :loop="indexInfo.banners?indexInfo.banners.length>1?true:false:false"
        >
          <CarouselItem
            v-for="item in indexInfo.banners"
            :key="item.id"
          >
            <div class="demo-carousel" @click="toGoBannerPath(item.path)">
              <my-img
                style="height:180px;width:100%;"
                :src="item.imgId? getUri('checkImg') + item.imgId: ''"
              ></my-img>
            </div>
          </CarouselItem>
        </Carousel>
      </li>

    </ul>

    <ul class="two-parts">
      <li >
        <div class=" three-parts second_row">
          <li class="business_letters" v-if="permiss.business">
            <div class="title">
              营业快报
            </div>
            <ul class="business_letters_item">
              <li>
                <div class="left">
                  <img
                    src="@/assets/images/icon/profit.png"
                    class="left" />
                </div>
                <div class="right">
                  <p>{{indexInfo.businessExpress.turnover || 0}}</p>
                  <p>今日营业额（元）</p>
                </div>
              </li>
              <li>
                <div class="left">
                  <img
                    src="@/assets/images/icon/expenditure.png"
                    class="left" />
                </div>
                <div class="right">
                  <p>{{indexInfo.businessExpress.purchaseCost || 0}}</p>
                  <p>今日支出（元）</p>
                </div>
              </li>
              <li>
                <div class="left">
                  <img
                    src="@/assets/images/icon/carin.png"
                    class="left" />
                </div>
                <div class="right">
                  <p>{{indexInfo.businessExpress.vehicleInto || 0}}</p>
                  <p>今日进厂（台次）</p>
                </div>
              </li>
              <li>
                <div class="left">
                  <img
                    src="@/assets/images/icon/carout.png"
                    class="left" />
                </div>
                <div class="right">
                  <p>{{indexInfo.businessExpress.vehicleOut || 0}}</p>
                  <p>今日出厂（台次）</p>
                </div>
              </li>
            </ul>
          </li>
          <li class="business_trend" v-if="permiss.business">
            <div class="title">
              <span>营业额趋势</span>
              <RadioGroup
                type="button"
                v-model="businessTrendModel"
                size="small"
              >
                <Radio
                  v-for="(item,index) in barBtns"
                  :key="index"
                  :label="item.value"
                  @click.native="changeTurnover(item.value)"
                >{{item.name}}</Radio>
              </RadioGroup>
            </div>
            <div class="bottom">
              <chart
                :options="barOpt"
                :auto-resize="true"
              >
              </chart>
            </div>
          </li>
        </div>
        <div>
          <w-tab
            :tabList="tabList"
            :tabIndex="tabIndex"
            @tab-change="tabChange"
          >
          </w-tab>
          <w-table
            class="index_table"
            ref="table"
            :columns="columns"
            :tableData="indexInfo.orders"
            :params="params"
          >
          </w-table>
        </div>

      </li>
      <li>
        <div class=" three-parts second_row">
          <li class="app_intro">
            <ul
              class="app_intro_item"
            >
              <li @mouseenter="showXlbCode=true" @mouseleave="showXlbCode=false">
                <div class="left">
                  <img
                    src="@/assets/images/icon/xlb.png"
                    class="left"
                  />
                </div>
                <div class="right">
                  <h4>XXX移动客户端</h4>
                  <p>使用手机APP、小程序管理门店</p>
                </div>
                <div class="hoverModal xlbModal" v-show="showXlbCode">
                  <div class="content">
                    <div class=" list">
                      <h4>XXXAPP</h4>
                      <p>扫描二维码下载</p>
                      <img
                        class="scan_code"
                        src="@/assets/images/course/index/xlb_app_download.png"
                        alt=""
                      >
                    </div>
                    <div class=" list">
                      <h4>XXX小程序</h4>
                      <p>扫描小程序二维码打开</p>
                      <img
                        class="scan_code"
                        src="@/assets/images/course/index/mini_xlb.png"
                        alt=""
                      >
                    </div>
                  </div>
                </div>
              </li>
              <li @mouseenter="showCarCode=true" @mouseleave="showCarCode=false">
                <div class="left">
                  <img
                    src="@/assets/images/icon/cyl.png"
                    class="left"
                  />
                </div>
                <div class="right">
                  <h4>车有料移动客户端</h4>
                  <p>车主的智能车管家</p>
                </div>
                <div class="hoverModal carModal" v-show="showCarCode">
                  <div class="content">
                    <div class=" list">
                      <h4>车有料APP</h4>
                      <p>扫描二维码下载</p>
                      <img
                        class="scan_code"
                        src="@/assets/images/course/index/car_app_download.png"
                        alt=""
                      >
                    </div>
                    <div class=" list">
                      <h4>车有料小程序</h4>
                      <p>扫描小程序二维码打开</p>
                      <img
                        class="scan_code"
                        src="@/assets/images/course/index/mini_car.png"
                        alt=""
                      >
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </div>
        <div class="flexColumn">
          <div class="xlb_notice">
            <div class="title">
              <span>XXX动态</span>
              <router-link
                class="more"
                target="_blank"
                to="/notice/version"
              >更多</router-link>
            </div>
            <ul class="xlb_notice_list">
              <li
                v-for="item in indexInfo.notices"
                :key="item._id"
              >
                <span class="label">{{item.type==='0'?'版本':'公告'}}</span>
                <router-link
                  class="content"
                  target="_blank"
                  :to="(item.type==='0' ? '/notice/detail/version/' : '/notice/detail/announce/') + item._id"
                >{{item.title}}</router-link>
              </li>
            </ul>
          </div>
          <div class="miniProgramCode">
            <div class="left">
              <img
                src="@/assets/images/course/index/mini_customer.png"
                class="left"
              />
            </div>
            <div class="right">
              <p>在线客服</p>
              <p class="bottom">微信扫码联系您的专属客服</p>
            </div>
          </div>
        </div>

      </li>
    </ul>
    <!-- <Alert
      class="index-alert"
      v-if="!store.eRecordAccount"
      type="warning"
      show-icon
    >
      汽车电子健康档案账号未绑定
      <template slot="desc">
        <span>系统检测到汽车电子健康档案账号未绑定，维修记录无法自动上传，请重新绑定账号</span>
        <Button
          type="primary"
          @click="toBind"
        >立即绑定</Button>
      </template>
    </Alert> -->
    <!-- <ul class="top-list">
      <li
        v-for="(item, index) in list"
        :key="index"
      >
        <i
          :class="['iconfont', item.icon]"
          :style="{ backgroundColor: item.color }"
        ></i>
        <div>
          <p class="price">{{ item.value || 0 }}</p>
          <p>{{ item.name }}</p>
        </div>
        <Spin
          fix
          v-if="loading"
        ></Spin>
      </li>
    </ul> -->
    <!-- <div class="chart-list">
      <w-charts
        :options="barOpt"
        :chartBtns="barBtns"
        title="门店营业额趋势"
        :loading="trendLoading"
        @renew-charts="renewBar"
      >
      </w-charts>
      <w-charts
        :options="radiusOpt"
        :chartBtns="radiusBtns"
        title="支付金额报表"
        :loading="reportLoading"
        @renew-charts="renewRadius"
      >
        <div
          slot="data"
          class="no-chart"
          v-if="Object.keys(turnoverReport).length == 0"
        >无支付金额数据
        </div>
      </w-charts>
    </div> -->

    <div
      class="other-link"
      v-if="showOtherLink"
    >
      <a
        href="//www.tengxincar.com?appid=test1&sign=abcdef&userid=a001"
        target="_blank"
      >
        <img
          src="/images/other/tengxin_logo.png"
          alt="腾信"
        >
      </a>
      <a
        href="//www.chelingwang.com?appid=test2&sign=abcdef&userid=a001"
        target="_blank"
      >
        <img
          src="/images/other/chelingwang_logo.png"
          alt="车铃网"
        >
      </a>
    </div>

    <speed-modal
      ref="speedMdaol"
      :initSelected="user.shortcutCodes"
      @toInitSelected="toInitSelected"
      @ok="requireSpeedModal"
    ></speed-modal>

    <Spin
      fix
      v-if="loading"
    ></Spin>

  </div>
</template>

<script>
import { storage, formatTime, timeSection } from '@/assets/js/utils'
import { mapGetters, mapState } from 'vuex'
import { GET_BRAND_LOGO } from '@/https/api'
import { shortCutMenus } from '@/store/json/default'
import '@/styles/views/index.less'
import wCharts from '@/components/echarts'
import selfDialog from '@/components/dialog/self-dialog'
import speedModal from './speedModal'
import { getUri } from '@/https/api.js'

export default {
  name: "Index",
  data () {
    let permiss = this.$permission.data.home;
    let perWorkListData = this.$permission.data.workerList
    let perWorkCleanData = this.$permission.data.workerCleanout
    let columns = [
      {
        title: '车牌号',
        key: 'plateNo',
        className: 'plate-no',
        width: 120,
        render: (h, { row }) => {
          return row.plateNo
            ? h('span', row.plateNo)
            : h(
                'span',
                {
                  attrs: {
                    class: 'none'
                  }
                },
                '暂无车牌号'
              )
        }
      },
      {
        title: '车型',
        key: 'vehicleBrand',
        minWidth: 200,
        render: (h, { row }) => {
          return h('div', {
            style: {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
           }, [
            h('my-img', {
              props: {
                src: GET_BRAND_LOGO + row.brandId
              },
              style: {
                minWidth: '33px',
                height: '33px',
                verticalAlign: 'middle',
                marginRight: '8px'
              }
            }),
            h(
              'span',
              row.vehicleBrand
                ? row.vehicleBrand === '其他品牌'
                  ? row.vehicleBrand
                  : row.vehicleBrand +
                    ' / ' +
                    row.carSeries +
                    ' / ' +
                    row.carStyle
                : '--'
            )
          ])
        }
      },
      {
        title: '客户姓名',
        key: 'vehicleOwner',
        minWidth: 60,
        align: 'center'
      },
      {
        title: '进厂时间',
        key: 'createdAt',
        minWidth: 200,
        align: 'center'
      },
      {
        title: '工单类型',
        width: 110,
        render: (h, { row }) => {
          return h('div', row.orderType === '1' ? '维修工单' : '洗美工单')
        }
      },

      {
        title: '操作',
        width: 40,
        align: 'center',
        render: (h, { row }) => {
          const canCheck = row.orderType === '1' ? perWorkListData.check : perWorkCleanData.check
          return h('div', canCheck ? [
            h(
              'Button',
              {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.$router.push('/customer/car/detail/' + row.vehicleId)
                  }
                }
              },
              '查看'
            )
          ] : '--')
        }
      }
      // {
      //   title: '车型',
      //   key: 'vehicleBrand',
      //   minWidth: 150,
      //   render: (h, { row }) => {
      //     return h('div', [])
      //   }
      // }
    ]
    return {
      permiss,
      perWorkListData,
      perWorkCleanData,
      shortCutMenus,
      columns,
      GET_BRAND_LOGO,
      showXlbCode: false,
      showCarCode: false,
      timeSection: timeSection(),
      user: {},
      params: {
        rows: 5
      },
      store: {},
      showOtherLinkCodes: ['370200'],
      businessTrendModel: 'day',
      barBtns: [
        { name: '按日', value: 'day' },
        { name: '按周', value: 'week' },
        { name: '按月', value: 'month' }
      ],
      radiusBtns: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '最近7天', value: '7days' },
        { name: '最近30天', value: '30days' }
      ],
      tabIndex: 0,
      speedSelectedArr: [],
      showModal: false,
      showModalType: '',
      loading: false

    }
  },

  created () {
    this.store = storage.get('STORE')
    this.$store.dispatch('toGetBusinessOverview')
    this.changeTurnover()
    this.changeReport()
    this.getIndexInfo()
    this.validToken()
  },

  mounted () {
  },

  computed: {
    tabList () {
      const arr = [
        {
          name: '在厂车辆',
          value: this.indexInfo.orderHeader.totalCount || 0,
          key: ''
        },
        {
          name: '待施工',
          value: this.indexInfo.orderHeader.buildCount || 0,
          key: '0'
        },
        {
          name: '待结算',
          value: this.indexInfo.orderHeader.workCount || 0,
          key: '1'
        },
        {
          name: '待出厂',
          value: this.indexInfo.orderHeader.factoryCount || 0,
          key: '2'
        }
      ]
      return arr
    },
    showOtherLink () {
      return this.showOtherLinkCodes.indexOf(String(this.store.cityCode)) > -1
    },
    ...mapGetters({
      businessOverview: 'getBusinessOverview',
      turnoverTrend: 'getTurnoverTrend',
      turnoverReport: 'getTurnoverReport'
    }),

    ...mapState({
      trendLoading: state => state.index.trendLoading,
      reportLoading: state => state.index.reportLoading,
      indexInfo: state => state.index.indexInfo
    }),

    // 柱状图
    barOpt () {
      const optData = {
        color: ['#FDAB29'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: '13%',
          left: '3%',
          right: '4%',
          bottom: '7%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'bar'
          }
        ]
      }

      if (this.turnoverTrend && this.turnoverTrend.turnover) {
        optData.xAxis.data = this.turnoverTrend.date
        optData.series[0].data = this.turnoverTrend.turnover
      }

      return optData
    },

    // 环形图
    radiusOpt () {
      const optData = {
        color: [
          '#fdb42f',
          '#ff7869',
          '#5eaffb',
          '#57d17d',
          '#e1967c',
          '#96d3b7'
        ],
        tooltip: {
          trigger: 'item',
          formatter: '{b}:<br/> ¥{c} ({d}%)'
        },
        title: [
          {
            text: '总支付金额',
            left: '49%',
            top: '44%',
            textAlign: 'center',
            textBaseline: 'middle',
            textStyle: {
              color: '#999',
              fontWeight: 'normal',
              fontSize: 14
            }
          },
          {
            text: '¥ 0',
            left: '49%',
            top: '51%',
            textAlign: 'center',
            textBaseline: 'middle',
            textStyle: {
              color: '#666',
              fontWeight: 'normal',
              fontSize: 24
            }
          }
        ],
        legend: {
          orient: 'vertical',
          top: 'center',
          right: 15,
          itemWidth: 15,
          itemHeight: 15,
          data: []
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: []
          }
        ]
      }

      if (this.turnoverReport && this.turnoverReport.total) {
        optData.title[1].text = '¥ ' + this.turnoverReport.total

        const dataArr = []
        const legendArr = []
        this.turnoverReport.rows.forEach((item, index) => {
          dataArr.push({
            name: item.name,
            value: item.turnover,
            percent: item.percent
          })
        })

        for (var n in dataArr) {
          legendArr.push(dataArr[n]['name'])
        }
        optData.legend.data = legendArr
        optData.series[0].data = dataArr
      }

      return optData
    },

    // 数据统计
    list () {
      const opt = [
        {
          icon: 'icon-yingyee',
          name: '今日营业额（元）',
          color: '#53A6FA',
          value: 0
        },
        {
          icon: 'icon-gongdanguanli',
          name: '今日工单数',
          color: '#4DCB73',
          value: 0
        },
        {
          icon: 'icon-zhifu',
          name: '今日支付笔数',
          color: '#FDAB29',
          value: 0
        },
        {
          icon: 'icon-lirun',
          name: '今日利润',
          color: '#FF6C5F',
          value: 0
        }
      ]

      if (this.businessOverview) {
        opt[0].value = this.businessOverview.turnover
        opt[1].value = this.businessOverview.maintainCount
        opt[2].value = this.businessOverview.payCount
        opt[3].value = this.businessOverview.profit
      }

      return opt
    }
  },

  methods: {
    getUri,
    async validToken () {
      this.loading = true
      let res = await this.$store.dispatch({
        type: "actionGet",
        name: "userInfo"
      });
      if (res.code !== "401") {
        storage.set('TOKEN', res.data.token);
        storage.set('USER', res.data.user);
        this.user = res.data.user
        storage.set('STORE', res.data.store);
      }
      this.loading = false
    },
    toGoBannerPath (path) {
      var reg = /^(http)s?:/
      if (reg.test(path)) {
        window.open(path, "_blank")
      } else {
        this.$router.push(path)
      }
    },
    showIntroModal (type) {
      this.showModalType = type
      this.showModal = true
    },

    goMyPerfomance () {
      this.$router.push(`/datareport/performance/detail?id=${this.user.userId}`)
    },
    goShortCutPath (code) {
      let path = this.shortCutMenus.find(item => item.code === code).path
      this.$router.push(path)
    },
    toInitSelected (selectedArr) {
      this.speedSelectedArr = selectedArr
    },
    async requireSpeedModal (obj) {
      const { selectedIds, selectedArr } = obj
      this.speedSelectedArr = selectedArr
      const arr = []
      selectedArr.map(item => arr.push(item.code))
      this.user.shortcutCodes = arr
      try {
        const result = await this.$store.dispatch('toEditAccountName', {
          params: this.user
        })
        if (result.code === '0') {
          this.$Message.success('成功')
        }
      } catch (error) {
        console.log(error)
      }
    },
    showSpeedModal () {
      this.$refs.speedMdaol.open()
    },

    tabChange (index) {
      this.getIndexInfo(this.tabList[index].key)
    },

    getIndexInfo (type = '') {
      this.$store.dispatch({
        type: 'toGetIndexInfo',
        params: { orderStatus: type }
      })
    },

    changeTurnover (by = 'day') {
      this.$store.dispatch({
        type: 'toGetTurnoverTrend',
        params: {
          by: by
        }
      })
    },

    renewBar (index) {
      this.changeTurnover(index)
    },

    changeReport (p = 'today') {
      this.$store.dispatch({
        type: 'toGetTurnoverReport',
        params: {
          p: p
        }
      })
    },

    renewRadius (index) {
      this.changeReport(index)
    },

    toBind () {
      // 去绑定健康档案
      this.$router.push('/store/health')
    }
  },

  components: { wCharts, speedModal, selfDialog }
}
</script>
