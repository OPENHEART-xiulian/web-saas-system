<template>
  <!-- 项目信息 -->
  <div>
    <Modal
      title="领料"
      v-model="modal"
      width="90%"
      ok-text="一键领取"
      @on-ok="getAllMaterial"
      :mask-closable="false"
    >
      <table class="input-list-table">
        <thead
          class="theader"
          v-if="formRows.length > 0"
        >
          <tr class="row">
            <th class="col">序号</th>
            <th class="col">配件编号</th>
            <th class="col">名称</th>
            <th class="col">单位</th>
            <th class="col">开单数量</th>
            <th class="col">已领数量</th>
            <th class="col">领料数量</th>
            <th class="col">出库类型</th>
            <th class="col">领料人 <Icon
                type="edit"
                class="selectMaterialHuman"
                @click="choiceGetHuman"
              ></Icon>
            </th>
            <th class="col">操作</th>
            <th
              class="col col-50"
              v-if="formRows.length > 0"
            ></th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            class="row"
            v-for="(item, index) in formRows"
            v-if="item.stockOutType!=='3'"
            :key="item.key"
          >
            <td>{{index+1}}</td>
            <td class="col">
              <Tooltip
                v-if="item.partNo"
                placement="top"
                :content="item.partNo"
              >{{item.partNo}}</Tooltip>
              <span v-else>--</span>
            </td>
            <td class="col">
              <Tooltip
                v-if="item.partName"
                placement="top"
                :content="item.partName"
              >{{item.partName}}</Tooltip>
              <span v-else>--</span>
            </td>
            <td class="col"><my-unit :unit="item.unit"></my-unit></td>
            <td class="col">
              {{item.quantity}}
            </td>
            <td class="col">{{item.receivedCount}}</td>
            <td class="col">
              <format-input
                v-model="item.getNum"
                :max=" Number(item.quantity)-Number(item.receivedCount) "
                :min="0"
                :disabled="item.receivedStatus==2"
                reg="PRECISION"
              >
              </format-input>
            </td>
            <td class="col">
              <i-select
                v-model="item.stockOutType"
                disabled
              >
                <i-option value="1">领料</i-option>
                <i-option value="2">即进即出</i-option>
              </i-select>
            </td>
            <td class="col">
              <Select
                v-model="item.receivedUserId"
                style="width:100%"
                :disabled="item.receivedStatus==2"
              >
                <Option
                  v-for="item in billUsers"
                  :value="item.value"
                  :key="item.value"
                >{{ item.label }}</Option>
              </Select>
            </td>
            <td class="col">
              <p>
                <span
                  v-if="item.receivedStatus==0"
                  class="ivu-btn-text selectMaterialHuman"
                  @click="getMaterial(item.componentId)"
                >确认领取</span>
                <span
                  v-else-if="item.receivedStatus==1"
                  class="ivu-btn-text selectMaterialHuman"
                  @click="getMaterial(item.componentId)"
                >确认领取</span>
                <span v-else>已领取</span>
              </p>

            </td>

          </tr>
          <tr
            class="no-data"
            v-if="formRows.length === 0"
          >
            <td colspan="11">暂无配件信息，请选择配件</td>
          </tr>
        </tbody>
      </table>
    </Modal>
    <Modal
      title="选择领料人(批量)"
      v-model="modalHuman"
      width="400px"
      ok-text="确认"
      :mask-closable="false"
      @on-ok="requireGetHuman"
      @on-cancel="modal=true"
    >
      <Select
        v-model="allHuman"
        style="width:100%"
      >
        <Option
          v-for="item in billUsers"
          :value="item.value"
          :key="item.value"
        >{{ item.label }}</Option>
      </Select>
    </Modal>

  </div>
</template>

<script>
import CKSelectGetMaterial from './ck-select-get-material'
import CKSelect from './ck-select'
import mixins from './mixins.js'
import { storage } from '@/assets/js/utils.js'
import { formatTime } from '@/assets/js/utils'
import '@/styles/views/workorder/receive-material.less'
export default {
  components: { CKSelectGetMaterial, CKSelect },
  mixins: [mixins],
  props: {
    requestRole: {
      default: 'worker',
      type: String
    }
  },
  data () {
    return {
      focusIndex: 0,
      tempObject: {},
      formRows: [],
      modal: false,
      modalHuman: false,
      row: {
        partName: '', // 配件名称
        partNo: '', // 配件编号
        stockOutType: '', // 出库类型
        brand: '', // 配件品牌
        quantity: '', // 配件数量
        originQuantity: '', // 配件库存
        retailPrice: '', // 销售价
        purchasePrice: '', // 成本价
        realityCost: '', // 配件金额 （ 显示）
        cost: '' // 配件金额 （提交）
      },
      storage,
      allHuman: '',
      formDataGetMaterial: {
        billUser: {
          userId: '',
          userName: ''
        }, // '开单人'
        serviceAdvisor: {
          userId: '',
          userName: ''
        }, // '服务顾问'
        isCompleted: '0', // 是否验证通过
        statementNo: '', // 结算单编号 20位数字
        createdAt: '', // 开单时间 格式： YYYY-MM-DD HH:mm:ss
        vehicleId: '', // 车辆id
        customerId: '', // 客户id
        vehicleOwner: '', // 车辆所有人
        ownerMobile: '', // 车主电话
        repairName: '', // 送修人姓名

        repairFuel: '', // 送修油量
        repairMobile: '', // 送修人联系电话
        plateNo: '', // 车牌号码
        vehicleBrand: '', // 车辆品牌
        brandId: '', // 品牌id
        carSeries: '', // 车系
        carStyle: '', // 车型
        subBrand: '', // 子品牌
        VINCode: '', // 车架号 VINcode
        engineNo: '', // 发动机号
        vehicleType: '', // 车辆类型
        appearance: {
          // 车辆外观检查
          front: [], // 前方
          right: [], // 右方
          left: [], // 左方
          back: [], // 后方
          top: [] // 顶部
        },
        stuff: [], // 随车装备
        malfunction: [], // 功能检查
        deliveryDate: new Date(), // 送修日期
        deliveryMileage: '', // 送修里程
        repairType: '', // 维修类型
        description: '', // 故障信息
        repairItems: [], // 维修项目列表 name：维修项目名称 hours：工时数 price：工时单价
        repairParts: [], // 维修配件列表 partNo：配件编号 quantity：配件数量
        others: [], // 其他项目列表 name：其他项目名称 cost：其他项目费用
        totalItemCost: '0', // 项目总费用
        totalPartCost: '0', // 配件总费用
        totalOtherCost: '0', // 其他总费用
        realCost: '0', // 实收总费用
        receivable: '0' // 应收总费用
      },
      formDataGetMaterialInit: {
        billUser: {
          userId: '',
          userName: ''
        }, // '开单人'
        serviceAdvisor: {
          userId: '',
          userName: ''
        }, // '服务顾问'
        isCompleted: '0', // 是否验证通过
        statementNo: '', // 结算单编号 20位数字
        createdAt: '', // 开单时间 格式： YYYY-MM-DD HH:mm:ss
        vehicleId: '', // 车辆id
        customerId: '', // 客户id
        vehicleOwner: '', // 车辆所有人
        ownerMobile: '', // 车主电话
        repairName: '', // 送修人姓名

        repairFuel: '', // 送修油量
        repairMobile: '', // 送修人联系电话
        plateNo: '', // 车牌号码
        vehicleBrand: '', // 车辆品牌
        brandId: '', // 品牌id
        carSeries: '', // 车系
        carStyle: '', // 车型
        subBrand: '', // 子品牌
        VINCode: '', // 车架号 VINcode
        engineNo: '', // 发动机号
        vehicleType: '', // 车辆类型
        appearance: {
          // 车辆外观检查
          front: [], // 前方
          right: [], // 右方
          left: [], // 左方
          back: [], // 后方
          top: [] // 顶部
        },
        stuff: [], // 随车装备
        malfunction: [], // 功能检查
        deliveryDate: new Date(), // 送修日期
        deliveryMileage: '', // 送修里程
        repairType: '', // 维修类型
        description: '', // 故障信息
        repairItems: [], // 维修项目列表 name：维修项目名称 hours：工时数 price：工时单价
        repairParts: [], // 维修配件列表 partNo：配件编号 quantity：配件数量
        others: [], // 其他项目列表 name：其他项目名称 cost：其他项目费用
        totalItemCost: '0', // 项目总费用
        totalPartCost: '0', // 配件总费用
        totalOtherCost: '0', // 其他总费用
        realCost: '0', // 实收总费用
        receivable: '0' // 应收总费用
      },

      requestObj: {
        worker: {
          type: '',
          request: ''
        },
        cleanout: {
          type: '',
          request: ''
        },
        sparepart: {
          type: '',
          request: ''
        }
      },

      canUpdateAll: false
    }
  },
  created () {
    // this.initList(this.defaultList || []);
  },
  methods: {
    // 根据操作状态排序
    sortStatus (arr = []) {
      if (arr.length === 0) return
      arr.sort((a, b) => {
        return Number(a.receivedStatus) - Number(b.receivedStatus)
      })
      console.log(arr)
      let showList = []
      arr.map(item => {
        if (
          Number(item.stockOutType) === 1 ||
          Number(item.stockOutType) === 2
        ) {
          showList.push(item)
        }
      })
      let canUpdateAll = false
      for (let n = 0; n < showList.length; n++) {
        if (Number(showList[n].receivedStatus) !== 2) {
          canUpdateAll = true
          break
        }
      }
      this.canUpdateAll = canUpdateAll
    },
    //  更新给个配件的可操作状态
    updatePartsStatus () {},
    requestFn (formData, componentId = '-1') {
      formData.orderPick = '1'
      switch (this.requestRole) {
        case 'worker':
          this.$store
            .dispatch({
              type: 'addWorkorder',
              payload: {
                request: 'updateWorkorder',
                params: formData
              }
            })
            .then(res => {
              if (res.code === '0') {
                this.$Message.success({
                  content: '保存成功'
                })
                this.updatedSuccess(componentId)
              } else {
                if (res.code === '107032') {
                  this.$Message.warning('维修配件不存在')
                } else if (res.code === '107099') {
                  this.$Message.warning(res.msg)
                }
              }
            })
            .catch(err => {})
          break
        case 'cleanout':
          this.$store
            .dispatch({
              type: 'toGetCareUpdate',
              params: formData
            })
            .then(res => {
              if (res.code === '0') {
                this.$Message.success({
                  content: '保存成功'
                })
                this.updatedSuccess(componentId)
              } else {
                if (res.code === '107032') {
                  this.$Message.warning('维修配件不存在')
                } else if (res.code === '107099') {
                  this.$Message.warning(res.msg)
                }
              }
            })
            .catch(err => {})
          break
        case 'sparepart':
          this.$store
            .dispatch({
              type: 'toGetSaleUpdate',
              params: formData
            })
            .then(res => {
              if (res.code === '0') {
                this.$Message.success({
                  content: '保存成功'
                })
                this.updatedSuccess(componentId)
              } else {
                if (res.code === '107032') {
                  this.$Message.warning('维修配件不存在')
                } else if (res.code === '107099') {
                  this.$Message.warning(res.msg)
                }
              }
            })
            .catch(err => {})
          break
        default:
          break
      }
    },
    updatedSuccess (componentId = '-1') {
      if (componentId !== '-1') {
        for (let n = 0; n < this.formRows.length; n++) {
          if (this.formRows[n].componentId === componentId) {
            this.formRows[n].getNum = 0
            break
          }
        }

        for (let n = 0; n < this.formDataGetMaterial.repairParts.length; n++) {
          if (
            componentId === this.formDataGetMaterial.repairParts[n].componentId
          ) {
            this.formDataGetMaterial.repairParts[n] = this.formRows.filter(
              item => item.componentId === componentId
            )[0]
            break
          }
        }
      }
      this.sortStatus(this.formRows)
    },
    // 领取
    getMaterial (componentId) {
      const formData = this.formatFormData(componentId)
      this.requestFn(formData, componentId)
    },
    // 批量领取
    getAllMaterial () {
      if (!this.canUpdateAll) {
        this.$Message.info('没有可领取的配件')
        return
      }
      const formData = this.formatFormData()
      this.requestFn(formData)
    },

    // 获取维修单详情
    async getStatementDetail (id) {
      let res = {}
      switch (this.requestRole) {
        case 'worker':
          res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'workDetail',
            params: {
              statementNo: id
            }
          })
          break
        case 'cleanout':
          res = await this.$store.dispatch({
            type: 'toGetCareDetail',
            params: {
              statementNo: id
            }
          })
          break
        case 'sparepart':
          res = await this.$store.dispatch({
            type: 'toGetSaleDetail',
            params: {
              statementNo: id
            }
          })
          break
        default:
          break
      }

      if (res.code === '0') {
        this.setDetailData(res.data)
      }
    },
    async setDetailData (to) {
      for (const key in this.formDataGetMaterial) {
        if (this.formDataGetMaterial.hasOwnProperty(key)) {
          this.formDataGetMaterial[key] = to[key]
        }
      }
      if (
        this.formDataGetMaterial.deliveryDate &&
        this.formDataGetMaterial.deliveryDate.length === 10
      ) {
        this.formDataGetMaterial.deliveryDate =
          this.formDataGetMaterial.deliveryDate + '00:00:00'
      }
      this.formDataGetMaterial.customerId = to.customerId
      this.formDataGetMaterial.vehicleId = to.vehicleId

      this.showVehicle = true

      let hasAppearance = '0'
      for (const key in this.formDataGetMaterial.appearance) {
        if (this.formDataGetMaterial.appearance.hasOwnProperty(key)) {
          const element = this.formDataGetMaterial.appearance[key]
          if (element.length > 0) {
            hasAppearance = '1'
            continue
          }
        }
      }

      this.modal = true
      // 初始化一个领料数量
      this.formDataGetMaterial.repairParts.map(item => {
        item.getNum = Number(item.quantity) - Number(item.receivedCount)
        if (item.stockOutType != 3) {
          if (item.quantity == 0) {
            item.receivedStatus = '0'
          } else if (item.quantity == item.receivedCount) {
            item.receivedStatus = '2'
          } else {
            item.receivedStatus = '1'
          }
        } else {
          item.receivedStatus = '1'
        }
      })
      this.initList(this.formDataGetMaterial.repairParts)
      this.formDataGetMaterialInit = JSON.parse(
        JSON.stringify(this.formDataGetMaterial)
      )
    },
    formatFormData (componentId = -1) {
      let formData = Object.assign({}, this.formDataGetMaterial)

      // 设置默认值
      if (formData.deliveryDate === '') {
        formData.deliveryDate = formData.createdAt
      }
      if (formData.deliveryMileage === '') formData.deliveryMileage = '0'
      // 清除空字符串
      for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
          const element = formData[key]
          if (element === '') delete formData[key]
        }
      }

      if (!formData.repairName) formData.repairName = ''
      if (!formData.repairMobile) formData.repairMobile = ''

      formData.deliveryDate = formatTime(
        formData.deliveryDate ? formData.deliveryDate : new Date().getTime(),
        'yyyy-MM-dd HH:mm:ss'
      )
      if (componentId !== -1) {
        formData = JSON.parse(JSON.stringify(this.formDataGetMaterial))
        let index = formData.repairParts.findIndex(
          item => item.componentId === componentId
        )
        formData.repairParts[index] = this.formRows.find(
          item => item.componentId === componentId
        )
        formData.repairParts[index].receivedCount =
          Number(formData.repairParts[index].receivedCount) +
          Number(formData.repairParts[index].getNum)
      } else {
        this.formRows.map((formItem, formIndex) => {
          if (Number(formItem.receivedStatus) !== 2) {
            let index = formData.repairParts.findIndex(
              item => item.componentId === formItem.componentId
            )
            formData.repairParts[index] = formItem
            formData.repairParts[index].receivedCount =
              Number(formData.repairParts[index].receivedCount) +
              Number(formData.repairParts[index].getNum)
          }
        })
      }

      formData.repairParts.forEach(item => {
        if (Number(item.receivedCount) === Number(item.quantity)) {
          item.receivedStatus = '2'
        } else {
          item.receivedStatus = '1'
        }
      })

      if (formData.repairItems.length === 0) delete formData.repairItems
      if (formData.repairParts.length === 0) delete formData.repairParts
      if (formData.others.length === 0) delete formData.others

      return formData
    },

    showModal (id) {
      this.getStatementDetail(id)
    },
    // 确认选择批量取料人
    requireGetHuman () {
      this.formRows.map(item => {
        item.receivedUserId = this.allHuman
      })
      this.modal = true
    },
    // 批量选择取料人
    choiceGetHuman () {
      this.modal = false
      this.modalHuman = true
    },
    initList (to) {
      let index = 0
      to.forEach(elm => {
        // 我也不知道这个elm componentId干嘛的 --熊凯文
        // elm.key = elm.componentId + new Date().getTime()
        elm.key = 'componentId' + ++index
        elm.receivedUserId
          ? (elm.receivedUserId = elm.receivedUserId)
          : (elm.receivedUserId = this.storage.get('USER').userId)
      })
      // this.formRows.splice(0, this.formRows.length, ...to);
      this.formRows = JSON.parse(JSON.stringify(to))
      this.sortStatus(this.formRows)
    }
  }
}
</script>
