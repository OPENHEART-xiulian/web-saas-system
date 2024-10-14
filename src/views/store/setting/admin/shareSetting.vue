<template>
    <div class="share-setting-class">
        <div class="title">用户/车辆信息共享</div>
        <div class="sec-title">请选择可共享“门店名称”数据的门店。</div>

        <div class="outputlist-container">
            <div class="search-wrap">
                <div>区域筛选：
                    <CitySelect @on-change="cityChange"></CitySelect>
                </div>
                <div>分组筛选：<Select @on-change="selectGroupIdChange" v-model="formData.storeGroup" style="width:200px">
                    <Option v-for="item in cityList" :value="item._id+''" :key="item._id">{{ item.groupName }}</Option>
                </Select></div>

                <i-input class="search-input" v-model="formData.storeName" placeholder="请输入门店关键字">
          <span class="prepend" slot="prepend">
            <i class="iconfont icon-sousuo"></i>
          </span>
                    <span class="append" slot="append" @click="search">搜索</span>
                </i-input>


            </div>

            <w-table
                    ref="table"
                    request="getInfoShareList"
                    :formData="formData"
                    :columns="columns"
                    :tableData="tableData">
            </w-table>
        </div>
        <div class="line"></div>

        <div class="title">已选择共享数据门店数：{{storeShareSets.length}} 间</div>
        <div class="select-item-list">
            <div v-for="ele in storeShareSets" class="select-item">{{ele.targetStoreName}}<i class="close_icon iconfont icon-close" @click="removeShare(ele._id)"></i></div>
        </div>


    </div>
</template>

<script>
    import "@/styles/views/inventory/output-list.less";
    import {mapGetters} from 'vuex';
    import {getCityText} from '@/store/json/city';
    import {outputStatus, getObj} from '@/store/json/default';
    import remindDialog from '@/components/dialog/remind-dialog';
    import CitySelect from '@/components/city-select';

    export default {
        components: {remindDialog, CitySelect},
        data() {
            let columns = [
                {title: '序号', type: 'index', width: 80},
                {
                    title: '门店名称',
                    key: 'storeName',
                    width: 240,
                    render: (h, {row, column}) => {
                        let elms = [h('span', row[column.key])];
                        if (row.masterStoreId === row._id) {
                            elms.push(h('span', {
                                class: 'item-tag'
                            }, '总店'));
                        }
                        return h('div', {
                            class: 'item-warpper'
                        }, elms)
                    }
                },
                {title: '门店分组', key: 'groupName',
                    render: (h, {row, column}) => {
                        return h('div', {}, row.groupName||"--")
                    }},
                {title: '门店地址', key: 'address'},

                {
                    title: '操作',
                    width: 140,
                    render: (h, {row}) => {
                        let elms = [];
                        if (row.isAdded) {
                            elms.push(h('Button', {
                                props: {type: 'text'},
                                style: {
                                    marginRight: "10px"
                                },
                                on: {
                                    click: () => {
                                        this.removeShare(row.shareId)
                                    }
                                }
                            }, '移除'));
                        } else {
                            elms.push(h('Button', {
                                props: {type: 'text'},
                                style: {
                                    marginRight: "10px"
                                },
                                on: {
                                    click: () => {
                                      this.addShare(row._id,this.$route.query.storeId);
                                    }
                                }
                            }, '添加'));
                        }
                        return elms;
                    }
                }
            ];
            return {
                formData: {storeName: '',storeGroup:'',checkStoreId:this.$route.query.storeId},
                columns,
                tableData: [],
                cityList: [],
                selectGroupId: '',
                storeShareSets:[]
            };
        },

        watch: {
            allTableData(to) {
                this.tableData = to.rows;
                this.storeShareSets=to.storeShareSets||[];
            },
        },

        computed: {
            ...mapGetters({
                allTableData: 'getAllTableData'
            })
        },
        mounted(){
            this.getGroupList()
        },
        methods: {
            selectGroupIdChange(e){
                console.log(e)
                this.search();
            },
            getGroupList(){
                this.$store.dispatch({
                    type: 'actionGet',
                    params: {

                    },
                    name: 'groupList'
                }).then((res) => {
                    if (res.code === '0') {
                       console.log(res)
                        this.cityList=res.data.rows;
                    }
                }).catch((err) => {
                    console.log(err);
                })
            },
            cityChange(data) {
                this.formData.provinceCode=data.provinceCode;
                this.formData.cityCode=data.cityCode;
                this.formData.countyCode=data.countyCode;
                this.search();
            },
            search() {
                this.$refs.table.init();
            },
            addShare(shareStoreId,targetStoreId){
                this.$store.dispatch({
                    type: 'actionPost',
                    params: {
                        shareStoreId,
                        targetStoreId
                    },
                    name: 'addShareGroup'
                }).then((res) => {
                    if (res.code === '0') {
                        this.$refs.table.init();
                    }
                }).catch((err) => {
                    console.log(err);
                })
            },
            removeShare(id){
                this.$Modal.confirm({
                    title: '确定移除？',
                    onOk: () => {
                        this.$store.dispatch({
                            type: 'actionPost',
                            params: {
                                id:id
                            },
                            name: 'removeShare'
                        }).then((res) => {
                            if (res.code === '0') {
                                this.$refs.table.init();
                            }
                        }).catch((err) => {
                            console.log(err);
                        })
                    }
                });

            }
        }
    };
</script>
<style>
    .city-select .ivu-select {
        width: 80px !important;
    }
</style>
<style lang="less" scoped>

    .title {
        font-size: 14px;
        font-weight: 400;
        text-align: left;
        color: #332e29;
        padding: 20px 20px 0;
    }

    .sec-title {
        font-size: 12px;
        font-weight: 400;
        color: #807d7c;
        padding: 5px 0 0 20px;
    }

    .search-wrap {
        justify-content: initial !important;
        position: relative;

        > div {
            display: flex;
            align-items: center;
            margin-right: 50px;
        }

        > div:last-child {
            position: absolute;
            right: 40px;

        }
    }

    .share-setting-class {
        background: white;
    }

    .line {
        height: 164px;
        background: #F7F4F2;
    }

    .select-item-list {
        display: flex;
        align-items: center;
        margin-top: 10px;
        margin-left: 20px;
        padding-top: 0;
        flex-wrap: wrap;


        .select-item {
            display: flex;
            align-items: center;
            padding: 5px 5px 5px 5px;
            background: #fcfbfa;
            height: 30px;
            border: 1px solid #e5e2df;
            border-radius: 2px;
            margin-right: 20px;
            margin-bottom: 20px;
            color: #332E29;

            i {
                margin: 0 11px;
            }
        }
    }
</style>
