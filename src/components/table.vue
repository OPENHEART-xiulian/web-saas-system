<template>
    <div class="w-table">
        <Table
                ref="table"
                @on-select="onSelect"
                @on-select-cancel="onSelectCancel"
                @on-selection-change="onSelectionChange"
                @on-sort-change="onSortChange"
                :columns="columns"
                :data="tableData"
                stripe
                :show-header="showHeader"
        >
        </Table>
        <div class="table-bottom">
            <div
                    class="operate-btn"
                    v-if="operate"
            >
                <Checkbox
                        v-model="all"
                        @on-change="checkAll"
                        :disabled="tableData.length === 0"
                >
                </Checkbox>
                <Button
                        type="default"
                        @click="delAll"
                        :disabled="selection.length === 0"
                >批量删除
                </Button>
            </div>
            <div
                    style="padding-top: 20px;margin-left: -15px"
                    v-if="batchUpdate"
            >
                <Checkbox
                        v-model="all"
                        @on-change="checkAll"
                        :disabled="tableData.length === 0"
                        v-if="!operate"
                >
                </Checkbox>
                <Button
                        type="default"
                        @click="batchUpdateAll"
                        :disabled="selection.length === 0"
                >批量变更
                </Button>
            </div>


            <!-- <w-pagination
              ref="page"
              v-if="isPagination"
              :showSizer="true"
              :total="tableTotal"
              @change="pageChange"
            >
            </w-pagination> -->
            <div v-show="isPagination"
                 style="display: flex; flex-grow: 1; justify-content: flex-end; padding-top: 20px;">
                <saas-page
                        ref="page"
                        :sizer="true"
                        :page="obj.page"
                        :rows="obj.rows"
                        :total="tableTotal"
                        @on-change="pageChange">
                </saas-page>
            </div>
        </div>
        <Spin
                fix
                v-if="loading"
        ></Spin>
    </div>
</template>

<script>
    import {mapGetters, mapState} from 'vuex'
    import '@/styles/components/table.less'

    export default {
        props: {
            autoInit: {
                type: Boolean,
                default: true
            },
            columns: Array,
            tableData: Array,
            operate: {
                type: Boolean,
                default: false
            },
            batchUpdate: {
                type: Boolean,
                default: false
            },
            request: String,
            formData: {
                type: Object,
                default() {
                    return {}
                }
            },
            params: {
                // 自定义参数
                type: Object,
                default() {
                    return {}
                }
            },
            selectDisabled: {
                // 表格不能删除的项数
                type: Number,
                default: 0
            },
            isPagination: {
                // 是否存在页码
                type: Boolean,
                default: true
            },
            showHeader: {
                // 是否显示表头
                type: Boolean,
                default: true
            }
        },

        data() {
            return {
                all: false, // 批量操作全选
                selection: [],
                obj: {
                    // 初始化
                    page: 1,
                    rows: 10
                }
            }
        },

        mounted() {
            this.autoInit && this.init()
        },

        computed: {
            ...mapGetters({
                tableTotal: 'getTableDataTotal'
            }),

            ...mapState({loading: state => state.global.isLoading})
        },

        methods: {
            init() {
                this.obj.page = 1
                this.$refs.page.reset() // 重置页码为1

                const form = Object.assign({}, this.params, this.obj, this.formData)
                if (!this.request) {
                    this.$emit('format-form', form)
                    return
                }

                this.search(form)
            },

            search(form) {
                this.$emit('format-form', form)
                const payload = {
                    request: this.request,
                    params: form
                }

                this.$store.dispatch({
                    type: 'toGetTableData',
                    payload
                })
                this.all = false
                this.selection = []
            },

            pageChange(params) {
                // 分页改变的时候设置查询表单数据
                this.obj = params
                const form = Object.assign({}, this.params, this.obj, this.formData)
                this.search(form)
            },

            onSelect(selection, row) {
                this.$emit('on-select', selection, row)
            },

            onSelectCancel(selection, row) {
                this.$emit('on-select-cancel', selection, row)
            },

            onSelectionChange(selection) {
                let tableLen = this.tableData.length - this.selectDisabled
                this.selection = selection
                this.$emit('on-selection-change', selection)
                if (selection.length > 0 && selection.length === tableLen) {
                    this.all = true
                } else {
                    this.all = false
                }
            },

            // 排序
            onSortChange(column, key, order) {
                switch (column.order) {
                    case 'asc':
                        this.params.sortOrder = '1'
                        this.params.orderBy = column.key
                        break
                    case 'desc':
                        this.params.sortOrder = '-1'
                        this.params.orderBy = column.key
                        break
                    default:
                        this.params.sortOrder = undefined
                        this.params.orderBy = undefined
                        break
                }
                this.init()
            },

            checkAll(value) {
                this.$refs.table.selectAll(value)
            },

            delAll() {
                this.$emit('del-all', this.selection)
            },
            batchUpdateAll(){
                this.$emit('update-all', this.selection)
            }
        },
    }
</script>
