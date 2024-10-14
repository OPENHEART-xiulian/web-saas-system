<template>
    <div class="service-list">
        <div>
            <div class="contentBody">
                <div class="left">
                    <div class="title">分组管理</div>
                    <Tree :data="treeData" @on-select-change="onSelectChange"></Tree>
                </div>

                <div class="right">
                    <div class="searchList">
                        <div class="searchInput">
                            <format-input placeholder="门店名称" v-model="formData.storeName">
                                <span slot="append" class="search_btn" @click="search">搜索</span>
                            </format-input>
                        </div>
                        <div class="f-right">
                            <Button
                                    type="primary"
                                    @click="$router.push('/store/setting/groupEdit')"
                            >
                                分组管理
                            </Button>
                        </div>
                    </div>

                    <w-table
                            ref="table"
                            :operate="true"
                            :batchUpdate="true"
                            request="getStoreGroupList"
                            :columns="columns"
                            :formData="formData"
                            :tableData="tableData"
                            @del-all="delAll"
                            @update-all="updateAll"
                    >
                    </w-table>
                </div>

            </div>

        </div>
        <!--变更弹框-->
        <Modal v-model="showPop" width="580" title="分组变更">
            <p><span v-for="(ele,index) in selection">{{ele.storeName+(selection.length-1==index?"":"，")}}</span></p>
            <div style="text-align:center">
                <div style="
font-size: 14px;
font-family: PingFangSC, PingFangSC-Regular;
font-weight: 400;
text-align: left;
color: #332e29;
margin-top: 20px;
">变更到：<Select v-model="groupListModel" style="width:200px;margin-left: 20px;">
                    <Option v-for="(item,index) in groupList" :value="item._id" :key="index">{{ item.groupName }}
                    </Option>
                </Select></div>
            </div>
            <div slot="footer">
                <Button type="text" size="large" @click.native.stop="showPop=false">取消</Button>
                <Button
                        type="primary"
                        @click="updateOrRemoveGroup(2,selection,groupListModel)"
                >
                    确定
                </Button>
            </div>
        </Modal>
        <remind-dialog
                ref="remindDialog"
                title="移出分组"
                :content="remindContent"
                @on-ok="updateOrRemoveGroup(1,selection)"
        ></remind-dialog>
    </div>

</template>

<script>
    import {mapGetters} from 'vuex'
    import noData from '@/components/no-data'
    import wCategory from '@/components/category'
    import {getUri} from '@/https/api.js'
    import {pricingMode, getObj} from '@/store/json/default'
    import '@/styles/views/store/service-list.less'
    import remindDialog from '@/components/dialog/remind-dialog'

    export default {
        data() {
            let permissionData = this.$permission.data.settingService
            let hasEdit = permissionData.update
            let columns = [
                {type: 'selection', width: 65},
                {title: '门店名称', key: 'storeName'},
                {
                    title: '门店负责人',
                    key: 'contactName',
                },
                {
                    title: '当前分组',
                    key: 'storeGroupName',

                },
                {
                    title: '门店地址',
                    key: 'address',

                },
                {
                    title: '操作',
                    width: 220,
                    render: (h, {row}) => {
                        let elms = []
                        elms.push(
                            h(
                                'Button',
                                {
                                    props: {type: 'text'},
                                    on: {
                                        click: () => {
                                            this.selection = [row];
                                            console.log(this.selection)
                                            this.showPop = true;
                                        }
                                    }
                                },
                                '分组变更'
                            )
                        )
                        elms.push(h('span', ' | '))
                        elms.push(
                            h(
                                'Button',
                                {
                                    props: {type: 'text'},
                                    on: {
                                        click: () => {
                                            this.selection = [row]
                                            this.remindContent = '确定把' + row.storeName + '从' + row.storeGroupName + '中移除吗？'
                                            this.$refs.remindDialog.openModal()
                                        }
                                    }
                                },
                                '移出分组'
                            )
                        )
                        return h('div', elms)
                    }
                }
            ]
            if (!hasEdit) columns.pop()
            return {
                showPop: false,
                remindContent: '',
                permissionData,
                action: getUri('serviceUpload'),
                // 删除参数
                remindContent: '',
                selection: [],
                // 筛选参数
                formData: {},

                data1: [
                    {
                        title: 'parent 1',
                        expand: true,
                        children: [
                            {
                                title: 'parent 1-1',
                                expand: true,
                                children: [
                                    {
                                        title: 'leaf 1-1-1'
                                    },
                                    {
                                        title: 'leaf 1-1-2'
                                    }
                                ]
                            },
                            {
                                title: 'parent 1-2',
                                expand: true,
                                children: [
                                    {
                                        title: 'leaf 1-2-1'
                                    },
                                    {
                                        title: 'leaf 1-2-1'
                                    }
                                ]
                            }
                        ]
                    }
                ],
                treeData: [],
                columns,
                groupList: [],
                groupListModel: ''
            }
        },

        created() {
            this.$store.dispatch({
                type: 'toGetServiceCloudCateList',
                params: {
                    includeOther: 1
                }
            })
            this.getGroupList();
            this.getStoreSetGroupsAndNotGroup()
        },

        // beforeRouteEnter (to, from, next) {
        //   if (to.query.refresh) {
        //     to.meta.keepAlive = false;
        //     next(to.path);
        //   } else {
        //     to.meta.keepAlive = true;
        //     next();
        //   }
        // },

        computed: {
            ...mapGetters({
                tableData: 'getTableData',
            })
        },

        watch: {

        },

        methods: {

            updateAll(selection) {
                console.log(selection)
                this.selection = selection;
                this.showPop = true;
            },
            async updateOrRemoveGroup(operateType, selectArray, storeSetGroupId) {
                let res = await this.$store.dispatch({
                    type: 'actionPost',
                    name: 'updateOrRemoveGroup',
                    params: {operateType: operateType + '', storeIds: selectArray, targeStoreGroupId: storeSetGroupId}
                });
                if (res.code == 0) {
                    this.$refs.remindDialog.onCancel();
                    this.showPop = false;
                    this.$refs.table.init()
                }
                this.getGroupList();
                this.getStoreSetGroupsAndNotGroup();

            },

            async getStoreSetGroupsAndNotGroup() {
                let res = await this.$store.dispatch({
                    type: 'actionGet',
                    name: 'getStoreSetGroupsAndNotGroup',
                    params: {}
                });
                console.log(res.data.rows)
                this.treeData = res.data.rows;
                this.categoryToTreeData(this.treeData)


            },
            async getGroupList() {
                let res = await this.$store.dispatch({
                    type: 'actionGet',
                    name: 'groupList',
                    params: {}
                });
                console.log(res.data.rows)
                this.groupList = res.data.rows;
            },
            onSelectChange(v) {
                const treeItem = v[0]
                console.log(treeItem)
                if (treeItem&&treeItem._id) {
                    this.formData.storeSetGroupId = treeItem._id
                } else {
                    delete this.formData.storeSetGroupId
                }

                this.$refs.table.init()
            },
            categoryToTreeData(categories) {
                categories.map(item => {
                    item.title = item.groupName+"  ("+item.storesTotalCount+")"
                    item.expand = false
                })
                console.log("categories===",categories)
            },

            search() {
                this.$refs.table.init()
            },

            toAdd() {
                this.$router.push('/store/service/add/create')
            },

            delAll(selection) {
                if (selection.length > 0) {
                    const arr = []
                    selection.forEach(item => {
                        arr.push(item._id)
                    })
                    this.selection = arr;
                    this.remindContent = '确认要移出分组吗？';
                    this.$refs.remindDialog.openModal()
                }
            },
            tabChange(code) {
                if (code) {
                    this.formData.code = code
                } else {
                    delete this.formData.code
                }

                this.$refs.table.init()
            },


            download(data) {
                this.$store.commit('setDownloadObj', {data: data})
                this.$router.push('/store/service/addCloud')
            },
        },

        components: {noData, wCategory, remindDialog}
    }
</script>
<style scoped>
    .change-text {

        font-size: 15px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: left;
        color: #332e29;
        margin-left: 20px;
    }


</style>
