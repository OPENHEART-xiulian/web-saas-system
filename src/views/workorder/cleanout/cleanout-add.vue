<template>
    <div class="add-form add-page">
        <saas-bread :title="breadName">
            <template slot="actions">
                <i-button type="default" @click="back">返回</i-button>
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

            <h2 class="title">接车信息</h2>
            <div class="search-form vehicle">
                <div class="form-box hide">
                    <i-form-item
                            class="form-item"
                            label="车辆外观检查"
                    >
                        <select-input
                                ref="appearanceInput"
                                @open-modal="openAppearanceDialog"
                                @on-change="appearanceChange"
                                placeholder="是否存在外观问题"
                                :data="[
                { value: '1', label: '存在问题', open: true },
                { value: '0', label: '无问题' },
              ]"
                        >
                        </select-input>
                    </i-form-item>
                    <i-form-item
                            class="form-item"
                            label="随车装备"
                    >
                        <Select
                                v-model="formData.stuff"
                                multiple
                                placeholder="是否有随车装备"
                        >
                            <Option
                                    v-for="item in vehicleEquipment"
                                    :value="item.value"
                                    :key="item.value"
                            >{{ item.label }}
                            </Option>
                        </Select>
                    </i-form-item>
                    <i-form-item
                            class="form-item"
                            label="功能检查"
                    >
                        <select-input
                                ref="functionInput"
                                @open-modal="openFunctionDialog"
                                @on-change="functionChange"
                                placeholder="是否存在功能异常"
                                :data="[
                { value: '1', label: '功能异常', open: true },
                { value: '0', label: '功能正常' }
              ]"
                        >
                        </select-input>
                    </i-form-item>
                    <i-form-item
                            class="form-item"
                            prop="serviceAdvisor"
                            label="服务顾问"
                    >
                        <Select v-model="formData.serviceAdvisor" multiple>
                            <Option
                                    v-for="item in billUsers"
                                    :value="item.value"
                                    :key="item.label"
                            >{{ item.label }}
                            </Option>
                        </Select>
                    </i-form-item>
                    <i-form-item class="form-item" prop="deliveryMileage" label="送修里程">
                        <format-input v-model="formData.deliveryMileage" reg="NUMBER" placeholder="输入送修里程">
                            <span slot="append">公里</span>
                        </format-input>
                    </i-form-item>
                    <i-form-item
                            class="form-item"
                            label="送修油量"
                    >
                        <Select
                                v-model="formData.repairFuel"
                                placeholder="请选择送修油量"
                        >
                            <Option
                                    v-for="item in repairOil"
                                    :value="item.value"
                                    :key="item.value"
                            >{{ item.label }}
                            </Option>
                        </Select>
                    </i-form-item>
                </div>
            </div>

            <h2 class="title">项目信息</h2>
            <div class="search-form input-list">
                <w-projects
                        ref="projects"
                        title="项目"
                        :default-list="formData.repairItems"
                        @on-change="projectChange"
                />
            </div>

            <h2 class="title">配件信息</h2>
            <div class="search-form input-list">
                <w-parts
                        ref="parts"
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
                <p class="workorder-price">工单金额：<span>￥{{formData.realCost | toFixed}}</span></p>
                <p>
                    <span>工时费￥{{formData.totalItemCost | toFixed}}</span>
                    <span>材料费￥{{formData.totalPartCost | toFixed}}</span>
                    <span>其他费用￥{{formData.totalOtherCost | toFixed}}</span>
                </p>
            </div>
            <i-button
                    type="error"
                    :loading="loading"
                    @click="submit"
            >{{btnName}}
            </i-button>
        </bottom-submit>
        <appearance-dialog
                ref="appearanceDialog"
                @select-success="appearanceSelect"
                @on-cancel="closeAppInput"
        />
        <function-dialog
                ref="functionDialog"
                @select-success="functionSelect"
                @on-cancel="closeFunInput"
        />
        <info-dialog ref="infoDialog"/>
    </div>
</template>

<script>
    import '@/styles/components/search-form.less'
    import '@/styles/views/workorder/add.less'
    import mixins from '../components/mixins.js'
    import {storage} from '@/assets/js/utils.js'
    import {formatTime, randomStr, verify} from '@/assets/js/utils'
    import {
        vehicleEquipment,
        vehicleType,
        repairTypeArr,
        repairOil
    } from '@/store/json/default'

    import SelectInput from './../components/select-input'
    import WProjects from './../components/workorder-projects' // 项目信息
    import WParts from './../components/workorder-parts' // 配件信息
    import WOthers from './../components/workorder-others' // 其他信息

    import AppearanceDialog from '@/components/dialog/appearance-dialog'
    import FunctionDialog from '@/components/dialog/function-dialog'
    import InfoDialog from '@/components/dialog/info-dialog'
    import CustomerSelect from '@/components/customer-select'

    export default {
        components: {
            WProjects,
            WParts,
            WOthers,
            CustomerSelect,
            SelectInput,
            AppearanceDialog,
            FunctionDialog,
            InfoDialog
        },
        mixins: [mixins],
        data() {
            const state = this.$route.params.id === 'create'
            const validate = (rules, value, callback) => {
                if (rules.required && value === '') {
                    return callback(rules.message)
                }
                // 格式错误的时候 提示错误
                if (value !== '' && rules.reg && !verify(rules.reg, value)) {
                    rules.message = rules.formatTip
                    return callback(rules.message)
                }
                callback()
            }
            return {
                storage,
                breadName: '洗美开单', // 面包屑文字
                btnName: state ? '生成工单' : '更新工单', // 提交按钮文字
                loading: false,
                state: state, // 状态 true 新增  false 更新
                vehicleEquipment, // 随车装备数组
                repairTypeArr, // 维修类型数组
                vehicleType, // 车辆类型数组
                repairOil, // 送修油量
                cityList: [
                    {
                        value: 'New York',
                        label: 'New York'
                    },
                    {
                        value: 'London',
                        label: 'London'
                    },
                    {
                        value: 'Sydney',
                        label: 'Sydney'
                    },
                    {
                        value: 'Ottawa',
                        label: 'Ottawa'
                    },
                    {
                        value: 'Paris',
                        label: 'Paris'
                    },
                    {
                        value: 'Canberra',
                        label: 'Canberra'
                    }
                ],
                model2: '',

                formData: {
                    billUser: {
                        userId: storage.get('USER').userId,
                        userName: storage.get('USER').userName
                    }, // '开单人'
                    serviceAdvisor: null, // '服务顾问'
                    deliveryMileage: "", // 送修里程
                    repairFuel: '', // 送修油量
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
                    repairItems: [], // 维修项目列表 name：维修项目名称 hours：工时数 price：工时单价
                    repairParts: [], // 维修配件列表 partNo：配件编号 quantity：配件数量
                    others: [], // 其他项目列表 name：其他项目名称 cost：其他项目费用
                    totalItemCost: '0', // 项目总费用
                    totalPartCost: '0', // 配件总费用
                    totalOtherCost: '0', // 其他总费用
                    realCost: '0', // 实收总费用
                    receivable: '0' // 应收总费用
                },

                rules: {
                    repairFuel: [
                        {
                            required: true,
                            message: '请选择送修油量',
                            trigger: 'blur'
                        }
                    ],
                    deliveryMileage: [
                        {
                            required: false,
                            message: "送修里程不能为空",
                            reg: "NUMBER",
                            formatTip: "送修里程只能为数字",
                            trigger: "blur",
                            validator: validate
                        }
                    ],
                    'serviceAdvisor': [
                        {
                            required: true,
                            type: 'array', min: 1, message: '请选择服务顾问', trigger: 'change'
                        },
                    ]
                }
            }
        },
        created() {
            this.$store.dispatch('toGetBillUsers')
        },
        mounted() {
            this.init()
        },
        methods: {
            // 返回上一页
            back() {
                this.$router.go(-1)
            },

            init() {
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
            async getStatementDetail() {
                const res = await this.$store.dispatch({
                    type: 'toGetCareDetail',
                    params: {
                        statementNo: this.$route.params.id
                    }
                })
                if (res.code === '0') {
                    this.setDetailData(res.data)
                }
            },

            setDetailData(to) {
                for (const key in this.formData) {
                    if (this.formData.hasOwnProperty(key)) {
                        this.formData[key] = to[key]
                    }
                }
                this.formData.serviceAdvisor = to.serviceAdvisorList;
                this.formData.customerId = to.customerId || ''
                this.formData.vehicleId = to.vehicleId
                if (!this.formData.billUser.userId) {
                    this.formData.billUser.userId = this.storage.get('USER').userId
                    this.formData.billUser.userName = this.storage.get('USER').username
                }

                let hasAppearance = '0'
                for (const key in this.formData.appearance) {
                    if (this.formData.appearance.hasOwnProperty(key)) {
                        const element = this.formData.appearance[key]
                        if (element.length > 0) {
                            hasAppearance = '1'
                            continue
                        }
                    }
                }
                let str = this.$refs.appearanceDialog.getKeyStr(this.formData.appearance)
                this.$refs.appearanceInput.setText(
                    hasAppearance,
                    hasAppearance === '1' ? str : '无问题'
                )

                let functionValue = this.formData.malfunction.length > 0 ? '1' : '0'
                let funcStr = this.$refs.functionDialog.getStr(this.formData.malfunction)
                this.$refs.functionInput.setText(
                    functionValue,
                    hasAppearance === '1' ? funcStr : '功能正常'
                )

                this.$refs.form.$nextTick().then(() => {
                    this.$refs.form.validate()
                })

                let customer = JSON.parse(JSON.stringify(to))
                customer.name = customer.vehicleOwner
                customer.mobile = customer.ownerMobile
                customer.vehicleIdList = customer.vehicleId ? [customer.vehicleId] : []
                this.$refs.customerSelect.setData(customer)
            },

            // 设置客户信息
            customerSelectChange(data) {
                if (data.isDefault) return
                if (data.isUpdateCustomer) {
                    this.formData.vehicleOwner = data.name || ''
                    this.formData.ownerMobile = data.mobile || ''
                    this.formData.repairName = data.name || ''
                    this.formData.repairMobile = data.mobile || ''
                    this.formData.customerId = data.customerId || ''
                }

                const vehicle = data.vehicleList[0] || {}
                this.setVehicleData(vehicle)
            },

            setVehicleData(data) {
                this.formData.VINCode = data.VINCode
                this.formData.engineNo = data.engineNo
                this.formData.plateNo = data.plateNo
                this.formData.vehicleBrand = data.vehicleBrand
                this.formData.subBrand = data.subBrand
                this.formData.carStyle = data.carStyle
                this.formData.brandId = data.brandId
                this.formData.vehicleId = data.vehicleId
                this.formData.vehicleType = data.vehicleType
            },

            async submit() {
                let self = this;
                // 先验证必填项，必填项空的时候不验证 或 填写了的格式是否正确
                if(!this.state){
                    let isValid = false;
                    this.$refs.form.validate(valid => {
                        isValid = valid;
                    });
                    if (!isValid) {
                        this.$Message.warning('请检查是否填写正确');
                        return;
                    } // 如果格式不正确，需要修改不正确的项
                }

                const formData = this.formatFormData()
                if (this.$route.params.id != "create"&&(!formData.repairItems && !formData.repairParts)) {
                    this.$Message.warning('请选择项目信息或配件信息')
                    return
                }

                let action = 'toGetCareAdd'
                if (!this.state) {
                    action = 'toGetCareUpdate'
                }
                let billUserName = this.billUsers.find(
                    item => item._id === this.formData.billUser.userId
                )
                console.log(billUserName)
                this.formData.billUser.userName = billUserName ? billUserName.label : ''
                //拼装服务顾问字段
                let newArray = [];
                for (let i in this.billUsers) {
                    if (self.formData.serviceAdvisor&&(self.formData.serviceAdvisor.indexOf(self.billUsers[i].value) != -1)) {
                        newArray.push({userName: self.billUsers[i].username, userId: self.billUsers[i].value})
                    }
                }
                delete formData.serviceAdvisor;
                formData.serviceAdvisorList = newArray;
                this.loading = true
                try {
                    const res = await this.$store.dispatch({
                        type: action,
                        params: formData
                    })

                    if (res.code === '0') {
                        this.$Message.success({
                            content: '保存成功',
                            onClose: () => {
                                this.loading = false
                                this.$router.push({
                                    path: '/workorder/cleanout/list',
                                    query: {type: 0, refresh: true}
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
                } catch (error) {
                    this.loading = false
                }
            },

            formatFormData() {
                let formData = Object.assign({}, this.formData)
                // 清除空字符串
                for (const key in formData) {
                    if (formData.hasOwnProperty(key)) {
                        const element = formData[key]
                        if (element === '') delete formData[key]
                    }
                }

                if (!formData.repairName) formData.repairName = ''
                if (!formData.repairMobile) formData.repairMobile = ''

                formData.repairItems = this.$refs.projects.getFormRows()
                formData.repairParts = this.$refs.parts.getFormRows()
                formData.others = this.$refs.others.getFormRows()

                formData.repairParts.forEach(item => {
                    if (Number(item.originQuantity) > 0) {
                        if (Number(item.originQuantity) === Number(item.quantity)) {
                            item.receivedStatus = '2'
                        } else {
                            item.receivedStatus = '1'
                        }
                    } else {
                        item.receivedStatus = '0'
                    }
                })

                if (formData.repairItems.length === 0) delete formData.repairItems
                if (formData.repairParts.length === 0) delete formData.repairParts
                if (formData.others.length === 0) delete formData.others

                return formData
            },

            projectChange(sum) {
                this.formData.totalItemCost = String(sum)
                this.getAllCost()
            },
            partChange(sum) {
                this.formData.totalPartCost = String(sum)
                this.getAllCost()
            },
            otherChange(sum) {
                this.formData.totalOtherCost = String(sum)
                this.getAllCost()
            },
            getAllCost() {
                let sum =
                    Number(this.formData.totalItemCost) +
                    Number(this.formData.totalPartCost) +
                    Number(this.formData.totalOtherCost)
                this.formData.realCost = String(sum)
                this.formData.receivable = String(sum)
            },
            /* =========== 弹窗操作 ============= */
            appearanceChange(data) {
                if (data.value === '0') {
                    this.formData.appearance = {}
                }
            },
            appearanceSelect(data) {
                this.formData.appearance = data
            },
            openAppearanceDialog(item, callback, index) {
                this.$refs.appearanceDialog.openModal(
                    callback,
                    item,
                    this.formData.appearance
                )
            },
            closeAppInput() {
                this.$refs.appearanceInput.closeSelect()
            },

            functionChange(data) {
                if (data.value === '0') {
                    this.formData.malfunction = []
                }
            },
            functionSelect(data) {
                this.formData.malfunction = data.term
            },
            openFunctionDialog(item, callback, index) {
                this.$refs.functionDialog.openModal(
                    callback,
                    item,
                    this.formData.malfunction
                )
            },
            closeFunInput() {
                this.$refs.functionInput.closeSelect()
            },
            openInfoDialog() {
                this.$refs.infoDialog.openModal()
            }
        },
        filters: {
            toFixed(v) {
                return Number(v).toFixed(2)
            }
        }
    }
</script>
