<template>
  <div class="service-list">
    <!-- <no-data v-show="tableData.length === 0"
      title="您还没创建任何服务项目"
      tip="建立服务项目资料库，新增工单更方便"
      :create="toAdd"></no-data> -->

    <div>
      <search-form
        v-show="isShow"
        :inputData="inputData"
        @form-data="getFormData"
      >
      </search-form>
      <!-- <w-category
        @tab-change="tabChange"
        :category="serviceCategory"
      ></w-category> -->
      <div class="contentBody">
        <div class="left">
          <div class="title">项目类别</div>
          <Tree :data="treeData" @on-select-change="onSelectChange" ></Tree>
        </div>
        
        <div class="right">
          <div class="searchList">
            <div class="searchInput">
              <format-input placeholder="项目名称" v-model="formData.serviceName">
                <span slot="append" class="search_btn" @click="search">搜索</span>
              </format-input>
            </div>
            <div class="f-right">
              <saas-toggle-btn v-model="isShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
              
              <Button
                v-if="permissionData.category"
                type="primary"
                @click="$router.push('/store/service/category')"
              >
                项目类别管理
              </Button>
              <Button
                v-if="permissionData.create"
                type="primary"
                @click="toAdd"
              >
                新建服务项目
              </Button>
              <Button
                v-if="permissionData.import"
                type="primary"
                @click="openUploadDialog"
              >
                导入服务项目
              </Button>
              <Button
                v-if="permissionData.import && !isMaster"
                type="primary"
                :loading="setPasswordLoading"
                @click="syncProject"
              >
                同步项目
              </Button>
            </div>
          </div>

          <w-table
            ref="table"
            :operate="hasDel"
            :autoInit="false"
            request="serviceList"
            :columns="columns"
            :formData="formData"
            :tableData="tableData"
            @del-all="delAll"
          >
          </w-table>
        </div>

      </div>

    </div>

    <remind-dialog
      ref="remindDialog"
      title="删除服务项目"
      :content="remindContent"
      @on-ok="delConfirm"
    >
    </remind-dialog>
    <remind-dialog
      ref="syncRemindDialog"
      title="同步项目"
      :content="syncRemindContent"
      @on-ok="setAsync(true)"
    >
    </remind-dialog>

    <upload-dialog
      ref="uploadDialog"
      templateName="批量导入项目模板.xlsx"
      :action="action"
      :show-temp="true"
      @on-cancel="search"
    >
    </upload-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {storage} from '@/assets/js/utils';
import noData from '@/components/no-data'
import wCategory from '@/components/category'
import remindDialog from '@/components/dialog/remind-dialog'
import UploadDialog from '@/components/dialog/upload-dialog'
import { getUri } from '@/https/api.js'
import { pricingMode, getObj } from '@/store/json/default'
import '@/styles/views/store/service-list.less'

export default {
  data () {
    let permissionData = this.$permission.data.settingService
    let hasEdit = permissionData.update
    let hasDel = permissionData.delete
    let columns = [
      { type: 'selection', width: 65 },
      { title: '序号', type: 'index', width: 65 },
      { title: '项目名称', key: 'serviceName' },
      {
        title: '类别',
        key: 'cateStr',
        render: (h, { row }) => {
          return h('div', row.cateStr && row.cateStr.split('/').pop())
        }
      },
      {
        title: '定价方式',
        key: 'pricingType',
        render: (h, { row }) => {
          return h('div', getObj(pricingMode)[row.pricingType])
        }
      },
      {
        title: '工时费',
        key: 'price',
        render: (h, { row }) => {
          return h('div', row.price || '--')
        }
      },
      {
        title: '工时',
        key: 'hours',
        render: (h, { row }) => {
          return h('div', row.hours || '--')
        }
      },
      {
        title: '总价',
        key: 'cost',
        render: (h, { row }) => {
          return h('div', row.cost || '--')
        }
      },
      {
        title: '操作',
        width: 120,
        render: (h, { row }) => {
          let elms = []
          if (hasEdit) {
            elms.push(
              h(
                'Button',
                {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/store/service/add/' + row.serviceId)
                    }
                  }
                },
                '编辑'
              )
            )
          }
          if (elms.length && hasDel) elms.push(h('span', ' | '))
          if (hasDel) {
            elms.push(
              h(
                'Button',
                {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.selection = [row.serviceId]
                      this.remindContent = '确认要删除这1项服务项目吗？'
                      this.$refs.remindDialog.openModal()
                    }
                  }
                },
                '删除'
              )
            )
          }
          return h('div', elms)
        }
      }
    ]
    if (!hasDel) columns.shift()
    if (!(hasEdit || hasDel)) columns.pop()
    return {
      permissionData,
      hasDel,
      action: getUri('serviceUpload'),
      isShow: false,
      // 删除参数
      remindContent: '',
      selection: [],
      // 筛选参数
      formData: {},
      inputData: [
        {
          type: 'select',
          key: 'pricingType',
          label: '定价方式',
          holder: '选择定价方式',
          data: pricingMode
        },
        {
          type: 'money',
          key1: 'costFrom',
          key2: 'costTo',
          label: '总价',
          data: pricingMode
        }
      ],
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
      setPasswordLoading: false,
      isMaster: true,
      syncRemindContent: ''
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetServiceCateList',
      params: {
        includeOther: 1
      }
    })
    this.init()
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
      serviceCategory: 'getServiceCateList'
    })
  },

  watch: {
    serviceCategory (value) {
      let obj = {}
      if (value) {
        obj =  JSON.parse(JSON.stringify(value)) 
        this.categoryToTreeData(obj)
        this.treeData = obj
        this.search()
      }
    }
  },

  methods: {
    async init () {
      try {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'storeDetail',
          params: {
            storeId: storage.get('STORE').storeId
          }
        })
        if (Number(res.code) === 0) {
          this.isMaster = res.data.isMasterStore
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },
    
    async setAsync ( isIngnore ) {
      this.setPasswordLoading = true
      try {
        const params = {}
        let tipsText = '同步成功'
        if (!isIngnore) {
          params.ignoreSync = true
          tipsText = '暂不设置成功'
        }
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'syncService',
          params: params
        })
        if (Number(res.code) === 0) {
          this.$Message.success(tipsText)
          if (isIngnore) {
            setTimeout( () => { this.$router.go(0) }, 400)        
          } else {
            this.showModal = false
          } 
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.setPasswordLoading = false
    },
    onSelectChange (v) {
      const treeItem = v[0]
      if (treeItem.code) {
        this.formData.code = treeItem.code
      } else {
        delete this.formData.code
      }

      this.$refs.table.init()
    },
    categoryToTreeData (categories) {
      categories.map(item => {
        item.title = item.name
        item.expand = false
        if (item.children) {
          this.categoryToTreeData(item.children)
        }
      })
    },

    search () {
      this.$refs.table.init()
    },

    toAdd () {
      this.$router.push('/store/service/add/create')
    },

    syncProject () {
      this.syncRemindContent = '该操作会把总店不同的项目添加至本地项目，是否立即同步？'
      this.$refs.syncRemindDialog.openModal()
    },

    delAll (selection) {
      if (selection.length > 0) {
        const arr = []
        selection.forEach(item => {
          arr.push(item.serviceId)
        })
        this.selection = arr
        this.remindContent = '确认要删除所选的服务项目吗？'
        this.$refs.remindDialog.openModal()
      }
    },

    getFormData (formData) {
      const code = this.formData.code
      this.formData = formData
      this.formData.code = code
      setTimeout(() => {
        this.$refs.table.init()
      }, 100)
    },

    tabChange (code) {
      if (code) {
        this.formData.code = code
      } else {
        delete this.formData.code
      }

      this.$refs.table.init()
    },

    // 确认删除
    delConfirm () {
      this.$store
        .dispatch({
          type: 'toDelService',
          params: {
            serviceIdList: this.selection
          }
        })
        .then(res => {
          if (res.code === '0') {
            this.$Message.success('删除成功')
            this.$refs.remindDialog.onCancel()
            this.$refs.table.init()
          } else {
            console.log(res.msg)
          }
        })
        .catch(err => {
          this.$store.commit('REQUEST_ERROR', { err })
        })
    },

    openUploadDialog () {
      this.$refs.uploadDialog.openModal()
    }
  },

  components: { noData, wCategory, remindDialog, UploadDialog }
}
</script>
