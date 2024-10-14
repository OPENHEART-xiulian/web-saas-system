<template>
  <div class="add-form add-page">
    <saas-bread :title="breadName">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
      </template>
    </saas-bread>
    <i-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-position="top"
      :show-message="true"
    >
      <div class="search-form header">
        <span>工单号：{{formData.statementNo}}</span>
        <i class="line"></i>
        <span>开单时间：{{formData.createdAt}}</span>
        <span style="float:right">
          开单人：
          <Select
            v-model="formData.billUser.userId"
            size="small"
            style="width:200px"
          >
            <Option
              v-for="item in billUsers"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </span>
      </div>

      <h2 class="title">客户信息</h2>
      <customer-select
        ref="customerSelect"
        class="search-form"
        :is-cry="true"
        :can-edit="true"
        @on-change="customerSelectChange"
      >
        <div class="form-box">
          <i-form-item
            class="form-item"
            prop="vehicleOwner"
            label="车辆所有人"
          >
            <i-input
              v-model="formData.vehicleOwner"
              placeholder="输入车辆所有人"
              disabled
            ></i-input>
          </i-form-item>
          <i-form-item
            class="form-item"
            label="联系电话"
          >
            <i-input
              v-model="formData.ownerMobile"
              :maxlength="11"
              placeholder="输入联系电话"
            ></i-input>
          </i-form-item>
          <i-form-item
            class="form-item"
            label="送修人姓名"
          >
            <i-input
              v-model="formData.repairName"
              placeholder="输入送修人姓名"
            ></i-input>
          </i-form-item>
          <i-form-item
            class="form-item"
            label="送修人联系电话"
          >
            <i-input
              v-model="formData.repairMobile"
              :maxlength="11"
              placeholder="输入送修人联系电话"
            ></i-input>
          </i-form-item>
        </div>
      </customer-select>

      <h2 class="title">配件信息</h2>
      <div class="search-form input-list">
        <w-parts
          ref="parts"
          :hide-since-beld="true"
          :default-list="formData.repairParts"
          @on-change="partChange"
        />
      </div>

      <h2 class="title">其它费用</h2>
      <div class="search-form input-list">
        <w-others
          ref="others"
          :default-list="formData.others"
          @on-change="otherChange"
        />
      </div>
    </i-form>

    <bottom-submit>
      <div class="slot-left">
        <p class="workorder-price">应收金额: <span>￥{{formData.realCost | toFixed}}</span></p>
        <p>
          <span>配件信息：{{ $refs.parts && $refs.parts.formRows.length }} 件</span>
        </p>
      </div>
      <i-button
        type="error"
        :loading="loading"
        @click="submit"
      >{{btnName}}</i-button>
    </bottom-submit>
  </div>
</template>

<script>
import '@/styles/components/search-form.less'
import '@/styles/views/workorder/add.less'
import { formatTime, randomStr } from '@/assets/js/utils'
import mixins from '../components/mixins.js'
import { storage } from '@/assets/js/utils.js'
import WParts from './../components/workorder-parts' // 配件信息
import WOthers from './../components/workorder-others' // 其他信息
import CustomerSelect from '@/components/customer-select'

export default {
  components: { WParts, WOthers, CustomerSelect },
  mixins: [mixins],
  data () {
    const state = this.$route.params.id === 'create'
    return {
      storage,
      breadName: '配件销售开单', // 面包屑文字
      btnName: state ? '生成工单' : '更新工单', // 提交按钮文字
      state: state, // 状态 true 新增  false 更新
      loading: false,
      formData: {
        billUser: {
          userId: storage.get('USER').userId,
          userName: storage.get('USER').userName
        }, // '开单人'
        statementNo: '', // 结算单编号 20位数字
        createdAt: '', // 开单时间 格式： YYYY-MM-DD HH:mm:ss
        vehicleId: '', // 车辆id
        customerId: '', // 客户id
        vehicleOwner: '', // 车辆所有人
        ownerMobile: '', // 车主电话
        repairName: '', // 送修人姓名
        repairMobile: '', // 送修人联系电话
        plateNo: '', // 车牌号码
        vehicleBrand: '', // 车辆品牌
        brandId: '', // 品牌id
        carSeries: '', // 车系
        carStyle: '', // 车型
        subBrand: '', // 子品牌
        repairParts: [], // 维修配件列表 partNo：配件编号 quantity：配件数量
        others: [], // 其他项目列表 name：其他项目名称 cost：其他项目费用
        totalPartCost: '0', // 配件总价
        totalOtherCost: '0', // 其他总价
        realCost: '0', // 实收金额
        receivable: '0' // 应收金额
      },

      rules: {
        vehicleOwner: [
          {
            required: true,
            message: '车辆所有人姓名不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.$store.dispatch('toGetBillUsers')
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 新建工单生成statementNo
      if (this.state) {
        this.formData.statementNo =
          randomStr(4) + formatTime(new Date(), 'yyMMddHHmmss') + randomStr(4)
        this.formData.createdAt = formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss')
      } else {
        this.getStatementDetail()
      }
    },
    // 获取维修单详情
    async getStatementDetail () {
      const res = await this.$store.dispatch({
        type: 'toGetSaleDetail',
        params: {
          statementNo: this.$route.params.id
        }
      })

      if (res.code === '0') {
        const data = res.data

        for (const key in this.formData) {
          if (this.formData.hasOwnProperty(key)) {
            this.formData[key] = data[key]
          }
        }

        this.formData.customerId = data.customerId || ''
        this.formData.vehicleId = data.vehicleId
        if (!this.formData.billUser) {
          this.formData.billUser = {
            userId: '',
            userName: ''
          }
        }
        if (!this.formData.billUser.userId) {
          this.formData.billUser.userId = this.storage.get('USER').userId
          this.formData.billUser.userName = this.storage.get('USER').username
        }
        let customer = JSON.parse(JSON.stringify(data))
        customer.name = customer.vehicleOwner
        customer.mobile = customer.ownerMobile
        customer.vehicleIdList = customer.vehicleId ? [customer.vehicleId] : []
        this.$refs.customerSelect.setData(customer)
      }
    },

    // 设置客户信息
    customerSelectChange (data) {
      if (data.isDefault) return
      if (data.isUpdateCustomer) {
        this.formData.vehicleOwner = data.name || ''
        this.formData.ownerMobile = data.mobile || ''
        this.formData.repairName = data.name || ''
        this.formData.repairMobile = data.mobile || ''
        this.formData.customerId = data.customerId || ''
      }

      const vehicle = data.vehicleList[0]
      this.setVehicleData(vehicle)
    },

    // 设置车辆信息
    setVehicleData (data) {
      this.formData.VINCode = data.VINCode || ''
      this.formData.engineNo = data.engineNo || ''
      this.formData.plateNo = data.plateNo || ''
      this.formData.vehicleBrand = data.vehicleBrand || ''
      this.formData.subBrand = data.subBrand || ''
      this.formData.carStyle = data.carStyle || ''
      this.formData.brandId = data.brandId || ''
      this.formData.vehicleId = data.vehicleId || ''
      this.formData.vehicleType = data.vehicleType || ''
    },

    async submit () {
      const formData = this.formatFormData()
      if (!formData.repairParts) {
        this.$Message.warning('请选择配件信息')
        return
      }

      let type = 'toGetSaleAdd'
      if (!this.state) type = 'toGetSaleUpdate'
      let billUserName = this.billUsers.find(
        item => item._id === this.formData.billUser.userId
      )
      this.formData.billUser.userName = billUserName ? billUserName.label : ''

      this.loading = true
      const res = await this.$store.dispatch({
        type: type,
        params: formData
      })

      if (res.code === '0') {
        this.$Message.success({
          content: '保存成功',
          onClose: () => {
            this.loading = false
            this.$router.push({
              path: '/workorder/sparepart/list',
              query: { type: 0, refresh: true }
            })
          }
        })
      } else {
        this.loading = false
        if (res.code === '107032') {
          this.$Message.warning('维修配件不存在')
        } else if (res.code === '107099') {
          this.$Message.warning(res.msg)
        }
      }
    },

    formatFormData () {
      const formData = Object.assign({}, this.formData)
      // 清除空字符串
      for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
          const element = formData[key]
          if (element === '') delete formData[key]
        }
      }

      if (!formData.repairName) formData.repairName = ''
      if (!formData.repairMobile) formData.repairMobile = ''

      formData.repairParts = this.$refs.parts.getFormRows()
      formData.others = this.$refs.others.getFormRows()

      if (formData.repairParts.length === 0) delete formData.repairParts
      if (formData.others.length === 0) delete formData.others

      return formData
    },

    partChange (sum) {
      this.formData.totalPartCost = String(sum)
      this.getAllCost()
    },

    otherChange (sum) {
      this.formData.totalOtherCost = String(sum)
      this.getAllCost()
    },

    getAllCost () {
      let sum =
        Number(this.formData.totalPartCost) +
        Number(this.formData.totalOtherCost)
      this.formData.realCost = String(sum)
      this.formData.receivable = String(sum)
    }
  },
  filters: {
    toFixed (v) {
      return Number(v).toFixed(2)
    }
  }
}
</script>
