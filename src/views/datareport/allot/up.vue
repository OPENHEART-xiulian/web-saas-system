<template>
    <!-- 配件采购统计 -->
    <div class="datareport-list">
        <saas-bread title="调出明细">
            <template slot="actions">
                <Button type="default" @click="goBack">返回</Button>
                <Dropdown trigger="click" @on-click="exportData">
                    <Button type="error">
                        导出
                        <i class="iconfont icon-sanjiaoxing-xia"></i>
                    </Button>
                    <DropdownMenu slot="list">
                        <!-- <DropdownItem name="pdf">PDF</DropdownItem> -->
                        <DropdownItem name="csv">CSV</DropdownItem>
                        <DropdownItem name="excel">Excel</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </template>
        </saas-bread>
        <div class="search-item">
            <btn-group
                    :chartBtns="btns"
                    :curKey="curKey"
                    :renewBtn="renewBtn">
            </btn-group>
            <DatePicker type="date"
                        v-model="params.dateFrom"
                        placeholder="开始时间"
                        :class="{'active': isDateFrom}"
                        @on-change="changeTimeFrom">
            </DatePicker>
            <DatePicker type="date"
                        v-model="params.dateTo"
                        placeholder="结束时间"
                        :class="{'active': isDateTo}"
                        @on-change="changeTimeTo">
            </DatePicker>
        </div>
        <list-detail :list="dataList"></list-detail>
        <w-table
                ref="table"
                request="getAllotReports"
                :params="params"
                :columns="columns"
                :tableData="tableData && tableData.rows">
        </w-table>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex';
    import btnGroup from '@/components/btn-group';
    import listDetail from '../list-detail';
    import {formatTime} from '@/assets/js/utils';
    import {AllotReports_STAT_EXPORT} from '@/https/api';
    import {unit, getObj} from '@/store/json/default';
    import '@/styles/views/datareport/list.less';

    export default {
        data() {
            return {
                curKey: '30days',
                btnCur: '30days',
                isDateFrom: false,
                isDateTo: false,
                params: {
                    p: '30days',
                    dateFrom: '',
                    dateTo: '',
                    subStoreId: this.$route.query.subStoreId,
                    detailType:"0"
                },
                dataList: [
                    {title: '调出配件数', value: '0', unit: '件'},
                    {title: '调出总额', value: '0', unit: '元'},
                    {title: '调拨费用', value: '0', unit: '元'},
                ],
                btns: [
                    {name: '一个月', value: '30days'},
                    {name: '三个月', value: '90days'},
                    {name: '半年', value: '183days'},
                    {name: '一年', value: '365days'}
                ],
                columns: [
                    {title: '序号', type: 'index', width: 65},
                    {title: '调拨单号', key: 'allotCode', width: 200},
                    {title: '调入门店', key: 'callinStoreName'},
                    {title: '配件名称', key: 'partName'},
                    {
                        title: '开单时间', key: 'createdAt', width: 200, render: (h, {row, column}) => {
                            return h('div', {}, formatTime(row.createdAt, "yyyy-MM-dd HH:mm:ss") || "--")
                        }
                    },
                    {title: '调拨状态', key: 'statusName'},
                    // {title: '调拨费用', key: 'calloutTotalCost'},
                    {title: '数量', key: 'quantity'},
                    {title: '单价', key: 'purchasePrice'},
                    {title: '总额', key: 'totalPurchasePrice'}

                ]
            }
        },

        computed: {
            ...mapGetters({
                tableData: 'getAllTableData'
            })
        },

        watch: {
            tableData(value) {
                if (value&&value.callInOutData) {
                    this.dataList[0].value = value.callInOutData.callOutComponentCount || 0;
                    this.dataList[1].value = value.callInOutData.callOutTotalCost || 0;
                    this.dataList[2].value = value.callInOutData.allotTotalCost || 0;
                }
            },

            $route(to) {
                this.$destroy();
            }
        },

        methods: {
            goBack() {
                this.$router.go(-1);
                this.$destroy();
            },
            exportData(type) {
                const params = this.params;
                const url = AllotReports_STAT_EXPORT + '?token=' + this.$storage.get('TOKEN') + '&t=' + type;
                let string = '';
                for (let i in params) {
                    if (params[i]) {
                        string = string + '&' + i + '=' + params[i];
                    }
                }
                window.location.href = url + string;
            },

            renewBtn(index) {
                this.curKey = index;
                this.btnCur = index;
                this.params.p = index;
                this.params.dateFrom = '';
                this.params.dateTo = '';
                this.isDateFrom = false;
                this.isDateTo = false;
                this.$refs.table.init();
            },

            changeTimeFrom(value, oldvalue) {
                if (value) this.params.dateFrom = formatTime(this.params.dateFrom, 'yyyy-MM-dd');

                this.search();
            },

            changeTimeTo(value, oldvalue) {
                if (value) this.params.dateTo = formatTime(this.params.dateTo, 'yyyy-MM-dd');

                this.search();
            },

            search() {
                if (this.params.dateFrom || this.params.dateTo) {
                    delete this.params.p;
                    this.curKey = '';
                } else {
                    this.params.p = this.btnCur;
                    this.curKey = this.btnCur;
                }

                // 日期是否选中状态
                if (this.params.dateFrom) {
                    this.isDateFrom = true;
                } else {
                    this.isDateFrom = false;
                }

                if (this.params.dateTo) {
                    this.isDateTo = true;
                } else {
                    this.isDateTo = false;
                }

                this.$refs.table.init();
            }
        },

        components: {btnGroup, listDetail}
    }
</script>
