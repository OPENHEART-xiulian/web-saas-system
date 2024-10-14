<template>
  <div>
    <div v-if="showCity" class="showCity">
      <img src="@/assets/images/icon/icon_default_shop.png" alt="">
      <p class="t1">当前门店城市暂未放开此功能</p>
      <p class="t2">敬请期待......</p>
    </div>
    <template v-else>
      <saas-bread title="线上项目">
        <Poptip trigger="hover" placement="bottom-start" width="438" :offset="-10" word-wrap class="saas-poptip">
          <i class="iconfont icon-bg-wenhao tip" style="transform: translateY(-0.6px);"></i>
          <div slot="title">
            <i class="iconfont icon-bg-wenhao"></i>
            在线项目
          </div>
          <div slot="content">发布在线项目后，可以在车有料app上展示项目的详细信息，在门店上获得店铺曝光机会。</div>
        </Poptip>
        <!-- <i class="iconfont icon-bg-wenhao tip" @mouseenter="toTip"></i> -->
        <template slot="actions">
          <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
          <Button v-if="permissionData.create" to="/market/online/create" type="primary">
            <span>发布线上项目</span>
          </Button>
        </template>
      </saas-bread>
      <div class="relative pt-20 white-bg">
        <div class="space-between pl-20 pr-20 searchBox">
          <saas-search-input v-model="params.name" placeholder="输入项目名称搜索" @on-search="onTableSearch"></saas-search-input>
          <template v-if="permissionData.status">
            <i-button @click="batchStatus('0')">批量上架</i-button>
            <i-button @click="batchStatus('1')">批量下架</i-button>
          </template>
        </div>

        <!-- 筛选表单 -->
        <saas-query
          ref="query"
          class="intable"
          query-class="column-3"
          v-show="queryShow"
          :loading="loading"
          :data="inputData"
          :auto="false"
          @on-query="onQuery"
          @on-reset="onQuery">
        </saas-query>

        <!-- 表格数据 -->
        <saas-table
          ref="table"
          api="getOnlineProjects"
          :auto="true"
          :columns="columns"
          :params="params"
          :close-loading="true"
          @on-selection-change="onSelectChange"
          @on-loading-change="onLoadingChange">
        </saas-table>
        <Spin size="large" fix v-if="loading"></Spin>

      </div>
      <remind-dialog
        ref="remindDialog"
        :title="dialogData.title"
        :content="dialogData.content"
        :showCancel="dialogData.showCancel"
        :confirmBtn="dialogData.confirmBtn"
        :isGantan="dialogData.isGantan"
        @on-ok="remindOk"
        :loading="btnLoading">
      </remind-dialog>
    </template>

  </div>
</template>

<script>
import onlineInputs from "@/commons/inputs/online-input";          // 筛选表单 -> 配件调拨
import onlineColumns from "@/commons/columns/online-column";       // 表格的列 -> 配件调拨
import commonColumns from "@/commons/columns/common-column";                   // 接口api
import { onlineProjectType, getLabel, healthCity } from "@/store/json/default";
import { getUri } from '@/https/api.js'
import { storage } from '@/assets/js/utils';
import RemindDialog from '@/components/dialog/remind-dialog';

export default {
  data () {
    let permissionData = this.$permission.data.settingOnline;
    let columns = [
      commonColumns.selection({fixed: "left"}),
      {
        title: '项目名称',
        minWidth: 120,
        key: 'name'
      },
      {
        title: '缩略图',
        minWidth: 120,
        render: (h, { row }) => {
          return h('my-img', {
            props: {
              src: row.introduceImgIds[0] ? getUri('checkImg') + row.introduceImgIds[0] : ''
            },
            style: {
              width: '40px',
              height: '40px'
            }
          });
        }
      },
      {
        title: '项目类型',
        minWidth: 120,
        render: (h, { row, column }) => {
          return [getLabel(row['type'], onlineProjectType)];
        }
      },
      {
        title: '价格',
        minWidth: 120,
        key: 'sortPrice',
        sortable: 'true'
      },
      {
        title: '曝光量',
        minWidth: 120,
        key: 'exposureCount',
        sortable: 'true'
      },
    ];
    let status = {
      title: "状态",
      key: "remindStatus",
      minWidth: 120,
      render: (h, { row }) => {
        // row.remindStatus { 0: 未处理, 1: 已处理 }
        let { status } = row;
        // switch组件
        let switchElm = h("i-switch", {
          props: {
            value: String(status),
            trueValue: "0",   // 已上架
            falseValue: "1"   // 已下架
          },
          on: {
            // 更新状态
            "on-change": v => {
              row.status = v;
              this.updateOnlineStatus(row._id, v)
            }
          }
        });

        let textElm = h("span", {
          style: { marginLeft: "4px" }
        }, Number(status) === 0 ? '上架' : '下架');
        return h("div", {
          style: { display: "flex" }
        }, [ switchElm, textElm ]);
      }
    }
    let actions = {
      title: '操作',
      width: 200,
      fixed: "right",
      render: (h, { row, index }) => {
        let elms = [];
        // 置顶
        if (permissionData.top ) {
          if (elms.length) elms.push(h('span', ' | '));
          elms.push(h('Button', {
            props: { type: 'text' },
            on: {
              click: () => {
                this.updateOnlineStatus(row._id, '2')
              }
            }
          }, '置顶'));
        }
        if (row.status === 1) {
          if (permissionData.update) {
            if (elms.length) elms.push(h('span', ' | '));
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$router.push('/market/online/' + row._id);
                }
              }
            }, '编辑'));
          }

          if (permissionData.delete) {
            if (elms.length) elms.push(h('span', ' | '));
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.curId = row._id;
                  this.dialogData.title = '删除线上项目';
                  this.dialogData.content = '线上项目删除后不可恢复，确定删除吗？';
                  this.dialogData.showCancel = true;
                  this.dialogData.confirmBtn = "确定";
                  this.dialogData.isGantan = true;
                  this.$refs.remindDialog.openModal();
                }
              }
            }, '删除'));
          }
        }
        return elms;
      }
    };

    if (permissionData.status) columns.push(status);
    if (permissionData.top || permissionData.update || permissionData.update) columns.push(actions);
    return {
      healthCity,
      permissionData,
      showCity: true,
      queryShow: false,
      btnLoading: false,
      loading: false,
      dialogData: {
        title: '',
        content: '',
        showCancel: '',
        confirmBtn: '',
        isGantan: true
      },
      curId: '',
      inputData: [
        onlineInputs.projectType(),
        onlineInputs.projectStatus(),
        onlineInputs.projectExposure(),
        onlineInputs.projectPrice()
      ],
      columns,
      params: {
        name: ""
      },
      selectedIds: []
    }
  },

  created () {
    this.isShowCity()
  },

  methods: {
    isShowCity () {
      const storeInfo = storage.get('STORE')
      if (storeInfo) {
        if (storeInfo.cityCode && this.healthCity.some(item => item.code === storeInfo.cityCode)) {
          this.showCity = false
        }
      }
    },
    // 获取门店员工列表，设置筛选数据
    async getStaffList () {
      let data = await this.$ajax.getStaffList();
      const arr = data.rows.map(v => ({ label: v.username, value: v.userId }));
      this.inputData[1].data = arr;
      this.inputData[2].data = arr;
      this.staffList = data;
    },
    // toTip () {
    //   this.dialogData.title = '在线项目';
    //   this.dialogData.content = '发布在线项目后，可以在车有料app上展示项目的详细信息，在门店上获得店铺曝光机会。';
    //   this.dialogData.showCancel = false;
    //   this.dialogData.confirmBtn = "我知道了";
    //   this.dialogData.isGantan = false;
    //   this.$refs.remindDialog.openModal();
    // },

    remindOk () {
      let status = '';
      let ids = []
      switch (this.dialogData.title) {
        case '删除线上项目':
          status = '4';
          ids.push( this.curId )
          this.updateOnlineStatus(ids, status)
          break;
        case '下架线上项目':
          request = '1';
          this.updateOnlineStatus(ids, status)
          break;
        default:
          this.$refs.remindDialog.onCancel();
      }
    },
    onSelectChange (selected) {
      this.selectedIds = selected.map(item => item._id)
    },
    batchStatus (status) {
      if (this.selectedIds.length === 0) {
        this.$Message.info('请先选择项目')
      } else {
        this.updateOnlineStatus(this.selectedIds, status)
      }
    },
    updateOnlineStatus (ids, status) {
      this.btnLoading = true;
      try {
        this.$store.dispatch({
          type: 'actionPost',
          params: {
            ids: Array.isArray(ids) ? ids : new Array(ids),
            status: status
          },
          name: 'updateOnlineProjectStatus'
        }).then((res) => {
          this.btnLoading = false;
          if (res.code === '0') {
            this.$Message.success('操作成功');
            this.$refs.remindDialog.onCancel();
            this.$refs.table.search();
          }
        }).catch((err) => {
          this.btnLoading = false;
        })
      } catch (error) {
        console.log(error)
      }
    },
    onQuery (params) {
      let { name } = this.params;
      params.name = name;
      this.params = params;
      this.onTableSearch();
    },
    // 设置参数筛选数据
    onTableSearch () {
      this.$refs.table.reset();
    },
    onLoadingChange (loading) {
      this.loading = loading;
    }
  },

  components: { RemindDialog }
}
</script>

<style lang="less" scoped>
  .showCity{
    background: #fff;
    margin:20px;
    height: calc( 100vh - 180px );
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    line-height: 1;
    .t1{
      font-size:18px;
      color:#564E45;
      margin:20px 0 10px;
    }
    .t2{
      font-size:14px;
      color:#8D847A;
    }
  }
  .searchBox{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .ivu-btn-default{
      margin-left:15px;
    }
  }
</style>
