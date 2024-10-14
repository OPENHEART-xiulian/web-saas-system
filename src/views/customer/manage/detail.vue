<template>
    <!-- 客户详情 -->
    <div class="customer-detail">
        <saas-bread title="客户详情">
            <template slot="actions">
                <i-button type="default" @click="$router.go(-1)">返回</i-button>
            </template>
        </saas-bread>

        <div class="box">
            <div class="box-item box-item-1">
                <div class="detail-top">
                    <img class="share-icon" src="/images/customer_icon_share@2x.png"
                         v-if="clientDetail.isShareCustomer"/>
                    <img src="/images/icon_user_orange.png">
                    <p>{{clientDetail.name}}</p>
                    <P class="detail-info">
                        <span>{{getObj(clientType)[clientDetail.customerType]}}</span>
                        <span>{{clientDetail.gender === 'male' ? '男' : (clientDetail.gender === 'female' ? '女' : '未知')}}</span>
                        <span>{{clientDetail.age || 0}}岁</span>
                    </p>
                </div>
                <div class="detail-center">
                    <p><i class="iconfont icon-dianhua1"></i>{{clientDetail.mobile || '未填写联系方式'}}</p>
                    <p><i class="iconfont icon-shengri"></i>{{clientDetail.birthday || '未填写出生日期'}}</p>
                    <p><i class="iconfont icon-dizhi"></i>{{clientDetail.provinceCode &&
                        (getCityText(clientDetail.provinceCode) + getCityText(clientDetail.cityCode) +
                        getCityText(clientDetail.countyCode)) || '未填写地址'}}</p>
                    <p><i class="iconfont icon-beizhu"></i>{{clientDetail.remark || '未填写备注'}}</p>
                    <div class="tag-box">
                        <Tag color="#FDEFE0"
                             v-for="item in clientDetail.tagList"
                             :key="item._id">{{item.name}}
                        </Tag>
                        <Poptip width="340"
                                @on-popper-show="tagPopperShow"
                                v-model="tagVisible">
                            <Button type="default" v-if="(this.$route.query.isSelfStore!='false')">添加标签</Button>
                            <div class="api" slot="content">
                                <template v-for="item in tagList">
                                    <Tag
                                            :key="item._id"
                                            v-if="!item.isDefault"
                                            :class="{'check-tag': item.check}"
                                            @click.native.stop="checkTag(item._id)">{{item.name}}
                                    </Tag>
                                </template>
                                <span class="add-tag" @click.stop="toEditTag" v-if="!showEdit">+</span>
                                <div class="tag-input" v-if="showEdit">
                                    <Input type="text" :maxlength="5" v-model="tagName"/>
                                    <i class="iconfont icon-dagou" @click.stop="addTag"></i>
                                    <i class="iconfont icon-guanbi" @click.stop="closeEditTag"></i>
                                </div>
                                <div class="tag-bottom">
                                    <Button type="text" @click.stop="toLabel">管理客户标签</Button>
                                    <div class="right-btn">
                                        <Button type="primary" @click.stop="confirmTag">确定</Button>
                                        <Button type="default" @click.stop="tagVisible = false">取消</Button>
                                    </div>
                                </div>
                            </div>
                        </Poptip>
                    </div>
                </div>
                <div class="detail-bottom" v-if="(this.$route.query.isSelfStore!='false')">
                    <i class="iconfont icon-bianji" @click="editClient"></i>
                    <Poptip
                            confirm
                            title="删除客户后不可恢复，确定删除吗？"
                            @on-ok="delCustomer">
                        <i class="iconfont icon-shanchu"></i>
                    </Poptip>
                </div>
                <Spin fix v-if="detailLoading"></Spin>
            </div>
            <div class="box-item box-item-2">
                <p class="title">消费总额</p>
                <chart :options="options"
                       :auto-resize="true">
                </chart>
                <div class="chart-detail" v-if="clientDetail.orderStat && clientDetail.orderStat.rows">
                    <p v-for="item in clientDetail.orderStat.rows" :key="item.name">
                        <span><i></i>{{ item.name }}</span>
                        <span>{{ item.orderCount }} 单</span>
                        <span>¥ {{ item.totalReceivable }}</span>
                    </p>
                </div>
                <Spin fix v-if="detailLoading"></Spin>
            </div>
            <div class="box-item box-item-3">
                <p class="title">卡券信息</p>
                <img src="@/assets/images/icon/card.png"/>
                <p>会员卡、优惠券功能正在路上</p>
                <p>敬请期待</p>
            </div>
        </div>

        <div class="bottom">
            <w-tab :tabList="tabList"
                   @tab-change="tabChangeSuccess"></w-tab>
            <Button class="add-btn" v-if="!tabValue&&(this.$route.query.isSelfStore!='false')" type="error"
                    @click="addBrand">新增车辆
            </Button>
            <w-table v-if="tabValue"
                     ref="recordTable"
                     request="customerOrderList"
                     :columns="recordColumns"
                     :tableData="tableData"
                     :params="{
          customerId: id
        }">
            </w-table>
            <w-table v-show="!tabValue && tableData.length > 0"
                     ref="vehicleTable"
                     class="table-width customer-vehicle-table"
                     request="customerVehicleList"
                     :columns="infoColumns"
                     :tableData="tableData"
                     :params="{
          customerId: id,
          storeId:this.$route.query.storeId
        }">
            </w-table>
            <div v-if="!tabValue && tableData.length === 0" class="no-vehicle">
                <i class="iconfont icon-xinzengcheliang"></i>
                <p>暂无车辆信息</p>
                <Button type="error" @click="addBrand" v-if="(this.$route.query.isSelfStore!='false')">新增车辆</Button>
                <Spin fix v-if="loading"></Spin>
            </div>
        </div>

        <remind-dialog
                ref="remindDialog"
                :title="remindTitle"
                :content="remindContent"
                :showCancel="showCancel"
                @on-ok="remindConfirm">
        </remind-dialog>
        <add-car ref="addBrand" @on-confirm="onConfirm" :auto-close="false" :required="true"></add-car>
        <add-brand ref="editClient" @on-confirm="clientConfirm" :auto-close="false" :client="true" :vehicle="false"
                   :required="true"></add-brand>
    </div>
</template>

<script>
    import {mapGetters, mapState} from 'vuex';
    import remindDialog from '@/components/dialog/remind-dialog';
    import AddBrand from '@/components/dialog/add-brand';
    import AddCar from './add-dialog';
    import {clientType, vehicleType, repairType, getObj} from '@/store/json/default';
    import {getCityText} from '@/store/json/city.js';
    import {GET_BRAND_LOGO} from '@/https/api';
    import {formatTime} from '@/assets/js/utils';
    import '@/styles/views/customer/customer-detail.less';

    export default {
        components: {remindDialog, AddBrand, AddCar},
        data() {
            return {
                getObj,
                clientType,
                getCityText,
                id: this.$route.params.id,
                tabValue: 0,
                remindTitle: '您没有该工单权限，不能查看',
                remindContent: '',
                tagVisible: false,
                showCancel: false,
                showEdit: false, // 标签编辑
                tagName: '',
                vehicleId: '', // 当前选择的车辆id
                resetTag: false, // 是否要刷新已选标签
                tabList: ['车辆信息', '消费记录'],
                infoColumns: [
                    {title: '序号', type: 'index', width: 65},
                    {
                        title: '车牌号',
                        key: 'plateNo',
                        className: 'plate-no',
                        render: (h, {row}) => {
                            return row.plateNo ? h('span', (row.plateNo)) : h("span", {
                                attrs: {
                                    class: "none"
                                }
                            }, "暂无车牌号");
                        }
                    },
                    {
                        title: '车型',
                        key: 'vehicleBrand',
                        minWidth: 150,
                        render: (h, {row}) => {
                            return h('div', [
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
                                h('span', row.vehicleBrand ? (row.vehicleBrand === '其他品牌' ? row.vehicleBrand : (row.vehicleBrand + ' / ' + row.carSeries + ' / ' + row.carStyle)) : '--')
                            ]);
                        }
                    },
                    {title: '消费次数', key: 'consumptionCount', width: 100},
                    {title: '消费总额', key: 'totalCost', width: 100},
                    {
                        title: '年检到期时间',
                        key: 'annualSurveyDate',
                        width: 120,
                        render: (h, {row}) => {
                            return h('div', row.annualSurveyDate || '--');
                        }
                    },
                    {
                        title: '保险到期时间',
                        key: 'compulsoryInsuranceExpireDate',
                        width: 120,
                        render: (h, {row}) => {
                            return h('div', (row.compulsoryInsuranceExpireDate && formatTime(row.compulsoryInsuranceExpireDate, 'yyyy-MM-dd')) || '--');
                        }
                    },
                    {
                        title: '操作',
                        width: 150,
                        render: (h, {row}) => {
                            if (this.$route.query.isSelfStore != 'false') {
                                return h('div', [
                                    h('Button', {
                                        props: {
                                            type: 'text'
                                        },
                                        on: {
                                            click: () => {
                                                this.$router.push('/customer/car/detail/' + row.vehicleId);
                                            }
                                        }
                                    }, '查看'),
                                    h('span', ' | '),
                                    h('Button', {
                                        props: {
                                            type: 'text'
                                        },
                                        on: {
                                            click: () => {
                                                let data = row;
                                                this.addBrand({vehicle: data});
                                            }
                                        }
                                    }, '编辑'),
                                    h('span', ' | '),
                                    h('Button', {
                                        props: {
                                            type: 'text'
                                        },
                                        on: {
                                            click: () => {
                                                this.vehicleId = row.vehicleId;
                                                this.remindTitle = '删除车辆';
                                                this.remindContent = '确定删除该车辆吗？';
                                                this.showCancel = true;
                                                this.$refs.remindDialog.openModal();
                                            }
                                        }
                                    }, '删除')
                                ])
                            } else {
                                return h('div', [
                                    h('Button', {
                                        props: {
                                            type: 'text'
                                        },
                                        on: {
                                            click: () => {
                                                this.$router.push('/customer/car/detail/' + row.vehicleId+"?storeId="+this.$route.query.storeId+"&isSelfStore="+this.$route.query.isSelfStore+"&customerId="+row.customerId);
                                            }
                                        }
                                    }, '查看')
                                ])
                            }


                        }
                    }
                ],
                recordColumns: [
                    {title: '序号', type: 'index', width: 65},
                    {title: '维修工单号', key: 'statementNo'},
                    {title: '车牌号码', key: 'plateNo'},
                    {
                        title: '车型品牌',
                        key: 'vehicleBrand',
                        minWidth: 150,
                        render: (h, {row}) => {
                            return h('div', row.vehicleBrand ? (row.vehicleBrand === '其他品牌' ? row.vehicleBrand : (row.vehicleBrand + ' / ' + row.carSeries + ' / ' + row.carStyle)) : '--');
                        }
                    },
                    {
                        title: '维修类型',
                        key: 'repairType',
                        render: (h, {row}) => {
                            return h('div', getObj(repairType)[row.repairType] || '--');
                        }
                    },
                    {
                        title: '结算日期',
                        key: 'settlementDate',
                        render: (h, {row}) => {
                            return h('div', row.settlementDate || '--');
                        }
                    },
                    {
                        title: '操作',
                        width: 65,
                        render: (h, {row}) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'text'
                                    },
                                    on: {
                                        click: () => {
                                            // if (!this.$permission.getPermissByKey(this.checkType(row.orderType))) {
                                            //   this.remindTitle = '您没有该工单权限，不能查看';
                                            //   this.remindContent = '';
                                            //   this.showCancel = false;
                                            //   this.$refs.remindDialog.openModal();
                                            //   return
                                            // }
                                            this.$router.push({path: '/workorder/' + this.checkType(row.orderType) + '/detail/' + row.statementNo});
                                        }
                                    }
                                }, '查看')
                            ])
                        }
                    }
                ],
            }
        },

        created() {
            this.getDetail();
            this.toGetTagList();
        },

        computed: {
            ...mapGetters({
                clientDetail: 'getClientDetail',
                tableData: 'getTableData',
                tagList: 'getCustomerTagList'
            }),

            ...mapState({
                loading: (state) => state.global.isLoading,
                detailLoading: (state) => state.storeClient.detailLoading
            }),

            // 环形图
            options() {
                const optData = {
                    color: ['#41A2FF', '#F2667D', '#FBDB66'],
                    tooltip: {
                        trigger: 'item',
                        formatter: "{b}:<br/> ¥{c} ({d}%)"
                    },
                    title: {
                        text: '¥ 0',
                        left: '49%',
                        top: '47%',
                        textAlign: 'center',
                        textBaseline: 'middle',
                        textStyle: {
                            color: '#332E29',
                            fontWeight: 'normal',
                            fontSize: 18
                        }
                    },
                    series: [{
                        type: 'pie',
                        radius: ['58%', '85%'],
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
                    }]
                };

                if (this.clientDetail && this.clientDetail.orderStat) {
                    optData.title.text = '¥ ' + this.clientDetail.orderStat.totalReceivable;
                    const arr = [];
                    this.clientDetail.orderStat.rows.forEach(item => {
                        arr.push({
                            value: parseFloat(item.totalReceivable),
                            name: item.name
                        })
                    });

                    optData.series[0].data = arr;
                }

                return optData;
            }
        },

        watch: {
            tagList(value) {
                if (value && this.resetTag) {
                    this.tagPopperShow();
                }
            }
        },

        methods: {
            getDetail() {
                this.$store.dispatch({
                    type: 'toGetClientDetail',
                    params: {
                        customerId: this.id,
                        storeId: this.$route.query.storeId
                    }
                });
            },

            toGetTagList() {
                this.$store.dispatch({
                    type: 'toGetCustomerTagList',
                    params: {
                        type: '1'
                    }
                });
            },

            toLabel() {
                this.$router.push('/customer/label');
            },

            toEditTag() {
                this.showEdit = true;
            },

            closeEditTag() {
                this.showEdit = false;
                this.tagName = '';
            },

            addTag() {
                if (!this.tagName) {
                    this.showEdit = false;
                    return;
                }

                this.$store.dispatch({
                    type: 'toGetCustomerTagSave',
                    params: {
                        name: this.tagName,
                        type: '1'
                    }
                }).then((res) => {
                    if (res.code === '0') {
                        this.resetTag = true;
                        this.toGetTagList();
                        this.$Message.success('添加成功');
                        this.closeEditTag();
                    }
                }).catch((err) => {
                    console.log(err);
                })
            },

            tagPopperShow() { // 标签提示框显示时触发
                const hasTagList = [];
                this.clientDetail.tagList.forEach(item => {
                    hasTagList.push(item._id);
                })

                this.tagList.forEach(item => {
                    this.$set(item, 'check', false);

                    if (hasTagList.includes(item._id)) {
                        this.$set(item, 'check', true);
                    }
                })
            },

            checkTag(id) {
                this.tagList.forEach(item => {
                    if (id === item._id) {
                        this.$set(item, 'check', !item.check);
                    }
                })
            },

            confirmTag() {
                const arr = [];
                this.tagList.forEach(item => {
                    if (item.check && !item.isDefault) {
                        arr.push(item._id);
                    }
                })

                this.$store.dispatch({
                    type: 'actionPost',
                    params: {
                        tagIdList: arr,
                        customerId: this.id
                    },
                    name: 'customerUpdateTag'
                }).then((res) => {
                    if (res.code === '0') {
                        this.getDetail();
                        this.tagVisible = false;
                    }
                }).catch((err) => {
                    console.log(err);
                })
            },

            tabChangeSuccess(value) {
                this.tabValue = value;
                if (value) {
                    setTimeout(() => {
                        this.$refs.recordTable.init();
                    });
                } else {
                    setTimeout(() => {
                        this.$refs.vehicleTable.init();
                    });
                }
            },

            checkType(type) { // 工单类型
                let orderType = 'worker';
                switch (type) {
                    case '1':
                        orderType = 'worker';
                        break;
                    case '2':
                        orderType = 'sparepart';
                        break;
                    case '3':
                        orderType = 'cleanout';
                        break;
                    default:
                        break;
                }
                return orderType;
            },

            remindConfirm() {
                switch (this.remindTitle) {
                    case '删除车辆':
                        this.delVehicle();
                        break;
                    default:
                        this.$refs.remindDialog.onCancel();
                        break;
                }
            },

            delCustomer() { // 删除客户请求
                this.$store.dispatch({
                    type: 'toDelClient',
                    params: {
                        customerIdList: [this.id]
                    }
                }).then((res) => {
                    if (res.code === '0') {
                        this.$Message.success({
                            content: '删除成功',
                            onClose: () => {
                                this.$router.push('/customer');
                            }
                        });
                    }
                }).catch((err) => {
                    this.$store.commit('REQUEST_ERROR', {err});
                })
            },

            delVehicle() { // 删除车辆
                this.$store.dispatch({
                    type: 'actionPost',
                    params: {
                        customerId: this.id,
                        vehicleId: this.vehicleId
                    },
                    name: 'customerVehicleDel'
                }).then((res) => {
                    if (res.code === '0') {
                        this.$refs.vehicleTable.init();
                        this.$refs.remindDialog.onCancel();
                        this.$Message.success('删除成功');
                    }
                }).catch((err) => {
                    this.$store.commit('REQUEST_ERROR', {err});
                })
            },

            addBrand(data) {
                data.customerType = this.clientDetail.customerType;
                this.$refs.addBrand.openModal(data);
            },

            editClient(data) {
                this.$refs.editClient.openModal({
                    client: this.clientDetail
                });
            },

            async onConfirm(data) {
                data.vehicle.customerId = this.id;
                try {
                    const res = await this.$store.dispatch({
                        type: 'actionPost',
                        name: 'vehicleSave',
                        params: data.vehicle
                    });
                    if (res.code === '0') {
                        this.$Message.success({
                            content: '保存成功',
                            onClose: () => {
                                data.callback();
                                this.$refs.vehicleTable.init();
                            }
                        });
                    } else {
                        data.callback();
                    }
                } catch (error) {
                    data.callback();
                }
            },

            async clientConfirm(data) {
                try {
                    const res = await this.$store.dispatch({
                        type: 'actionPost',
                        name: 'clientUpdate',
                        params: data.client
                    });
                    if (res.code === '0') {
                        this.$Message.success({
                            content: '保存成功',
                            onClose: () => {
                                data.callback();
                                this.getDetail();
                            }
                        });
                    } else {
                        data.callback();
                    }
                } catch (error) {
                    data.callback();
                }
            }
        }
    }
</script>
<style scoped>
    .customer-detail .box .detail-top .share-icon {
        display: block;
        width: 20px;
        height: 20px;
        position: absolute;
        left: 54%;
        top: 25px;
    }
</style>
