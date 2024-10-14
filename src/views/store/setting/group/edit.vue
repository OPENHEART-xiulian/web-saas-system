<template>
    <div style="padding-right: 20px">
        <saas-bread title="分组管理">
            <div class="btn-list"><i-button style="width: 120px;height: 40px;" @click="$router.go(-1)">返回</i-button><i-button @click="add()" style="margin-left:20px;color:white;background: #F22D00; width: 120px;height: 40px;">新增分组</i-button> </div>
        </saas-bread>
        <w-table
                ref="table"
                request="groupList"
                :columns="columns"
                :formData="formData"
                :tableData="tableData"
        >
        </w-table>
        <Modal v-model="updateModel" width="360">
            <p slot="header" >
                编辑分组
            </p>
            <div style="text-align:center">
                <i-input></i-input>
            </div>


        </Modal>

    </div>

</template>

<script>
    import {mapGetters} from 'vuex'
    // import Input from "../../../../../lib/vendor.dll";
    import {storage} from '@/assets/js/utils';
    export default {
        // components: {Input},
        data() {
            let self =this;
            return {
                value:'',
                formData: {},
                updateModel:false,
                storeId:storage.get('STORE').storeId,
                columns :[
                    {title: '分组名称', key: 'groupName'},

                    {
                        title: '操作',
                        width: 120,
                        render: (h, {row}) => {
                            let elms = []
                                elms.push(
                                    h(
                                        'Button',
                                        {
                                            props: {type: 'text'},
                                            style: {
                                                marginRight: "10px"
                                            },
                                            on: {
                                                click: () => {
                                                    this.$Modal.confirm({
                                                        // title: "删除分组",
                                                        render: (h) => {
                                                            return h('Input', {
                                                                props: {
                                                                    value: row.groupName,
                                                                    autofocus: true,
                                                                    placeholder: '请输入分组名称'
                                                                },
                                                                on: {
                                                                    input: (val) => {
                                                                        self.value = val;
                                                                    }
                                                                }
                                                            })
                                                        },
                                                        onOk(){
                                                            self.$store.dispatch({
                                                                type: 'actionPost',
                                                                params: {
                                                                    id:row._id,
                                                                    groupName:self.value
                                                                },
                                                                name: 'updateGroup'
                                                            }).then((res) => {
                                                                if (res.code === '0') {
                                                                    self.$refs.table.init();
                                                                }
                                                            }).catch((err) => {
                                                                console.log(err);
                                                            })
                                                        }
                                                    })
                                                },
                                            }
                                        },
                                        '编辑'
                                    )
                                )
                                elms.push(
                                    h(
                                        'Button',
                                        {
                                            props: {type: 'text'},
                                            on: {
                                                click: () => {
                                                    //先判断是否有门店存在
                                                    self.$store.dispatch({
                                                        type: 'actionGet',
                                                        params: {
                                                            storeSetGroupId:row._id
                                                        },
                                                        name: 'getStoreGroupList'
                                                    }).then((res) => {
                                                        if (res.code === '0') {
                                                            console.log("hahah-",res)
                                                            if(res.data.total>0){
                                                                this.$Modal.confirm({
                                                                    title: "删除分组",
                                                                    content: "该分组已存在门店，删除后门店将变更为无分组状态，是否确认删除？",
                                                                    onOk(){
                                                                        self.deleteGroup(row._id);
                                                                    }
                                                                })
                                                            }else {
                                                                self.deleteGroup(row._id);
                                                            }
                                                        }
                                                    }).catch((err) => {
                                                        console.log(err);
                                                    })



                                                },
                                            }
                                        },
                                        '删除'
                                    )
                                )
                            return h('div', elms)
                        }
                    }
                ]
            }
        },
        computed: {
            ...mapGetters({
                tableData: 'getTableData',
                serviceCategory: 'getServiceCloudCateList'
            })
        },

        mounted() {

        },

        methods:{
            deleteGroup(id){
                let self=this;
                self.$store.dispatch({
                    type: 'actionPost',
                    params: {
                        id:id
                    },
                    name: 'deleteGroup'
                }).then((res) => {
                    if (res.code === '0') {
                        self.$refs.table.init();
                    }
                }).catch((err) => {
                    console.log(err);
                })
            },
            add(){
                let self=this;
                this.$Modal.confirm({
                    render: (h) => {
                        return h('Input', {
                            props: {
                                value:'',
                                autofocus: true,
                                placeholder: '请输入分组名称'
                            },
                            on: {
                                input: (val) => {
                                    self.value = val;
                                }
                            }
                        })
                    },
                    onOk(){
                        self.$store.dispatch({
                            type: 'actionPost',
                            params: {
                                storeId:self.storeId,
                                groupName:self.value
                            },
                            name: 'addGroup'
                        }).then((res) => {
                            if (res.code === '0') {
                                self.$refs.table.init();
                            }
                        }).catch((err) => {
                            console.log(err);
                        })
                    }
                })
            }
        }
    };
</script>
<style  lang="less">
    .btn-list{
        position: absolute;
        right: 0;
    }
    .saas-bread__slots{
        height: 100%;
        display: flex;
        align-items: center;
        position: relative;
    }
</style>

