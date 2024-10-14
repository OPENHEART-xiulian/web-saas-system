<template>
  <!-- 平台项目 -->
  <div class="market-platform relative mt-20 pt-20 white-bg">
    <div class="space-between pl-20 pr-20">
      <saas-search-input v-model="params.name" placeholder="输入项目名称搜索" @on-search="onTableSearch"></saas-search-input>
      <div style="flex-grow: 1;" v-if="permiss.change">
        <i-button style="margin-left: 15px;" :disabled="!selections.length" type="default" @click="updateStatus(selections, true, true)">批量上架</i-button>
        <i-button style="margin-left: 10px;" :disabled="!selections.length" type="default" @click="updateStatus(selections, false, true)">批量下架</i-button>
      </div>
      <saas-toggle-btn v-model="queryShow" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
    </div>

    <!-- 筛选表单 -->
    <saas-query 
      v-show="queryShow" 
      ref="query"
      class="intable"
      query-class="column-3"
      :loading="loading"
      :data="queryData"
      :auto="false"
      @on-query="onQuery">
    </saas-query>

    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getPlatformProjectList"
      :auto="false"
      :columns="columns"  
      :params="params"
      :default-params="defaultParams"
      :close-loading="true"
      @on-selection-change="onSelectionChange"
      @on-success="onTableSuccess"
      @on-loading-change="onLoadingChange">
    </saas-table>
    <Spin size="large" fix v-if="loading"></Spin>
    <div class="qr-dialog" v-show="qrShow">
      <div class="dialog-content">
        <div class="dialog-title">
          <Icon type="md-close" @click.native="qrShow = false" />
        </div>
        <div class="dialog-text">扫描二维码查看效果</div>
          <!-- logoSrc="https://file.iviewui.com/dist/7dcf5af41fac2e4728549fa7e73d61c5.svg"
          :logoScale="0.2" -->
        <qrcode 
          class="qr-wrap"
          :text="qrUrl"
          :margin="0"
          colorDark="#332e29"
          colorLight="#fff"
          :size="200">
        </qrcode>
      </div>
    </div>
  </div>
</template>
<script>
  import { commonRender, imageRender } from "@/commons/columns/common-render";
  import commonColumns from "@/commons/columns/common-column";
  import { CYLH5_HOST } from "@/https/api";

  import { platformProjectTypes, platformProjectStatus } from "@/store/json/default";

  import mixins from "./minix";
  export default {
    mixins: [mixins],
    data () {
      let store = this.$storage.get('STORE');
      let permiss = this.$permission.data.marketPlatformProject;
      let columns = [
        commonColumns.selection(),
        { 
          title: "项目名称", 
          key: "name", 
          minWidth: 120,
          render: commonRender
        },
        {
          title: "缩略图",
          key: "introImgs",
          minWidth: 80,
          render: (h, { row, column }) => {
            return imageRender(h, row[column.key][0]);
          }
        },
        {
          title: "项目类型",
          key: "type",
          minWidth: 100,
          render: (h, { row, column }) => {
            return ["途康"];
          }
        },
        {
          title: "价格",
          key: "price",
          minWidth: 100,
          sortable: "custom",
          render: commonRender
        }     
      ];

      // 状态改变权限
      if (permiss.change) {
        columns.push(
        {
          title: "状态",
          key: "status",
          minWidth: 120,
          render: (h, { row, column }) => {
            let inOnlineProjects = this.onlineProjects.find(elm => elm == row._id);
            // 在列表里面表示已上架
            let status = inOnlineProjects ? "1" : "0";
            // switch组件
            let switchElm = h("i-switch", {
              props: {
                value: String(status),
                trueValue: "1",   // 选中代表未处理
                falseValue: "0"   // 不选择代表已处理
              },
              on: {
                // 更新状态
                "on-change": v => {
                  status = v;
                  this.updateStatus([row], v == "1");
                }
              }
            });

            let textElm = h("span", {
              style: { marginLeft: "4px" }
            }, status == "1" ? "上架" : "下架");
            
            return h("div", {
              style: { display: "flex" }
            }, [ switchElm, textElm ]);
          }
        });
      }
      
      // 预览权限
      if (permiss.preview) {
        columns.push({
          title: "操作",
          width: 100,
          fixed: "right",
          render: (h, { row }) => {
            let elms = [];
            elms.push(
              h("i-button", {
                props: { type: "text" },
                on: {
                  click: () => {
                    this.qrUrl = `${CYLH5_HOST}/#/platformActivity?channel=H5&preview=true&id=${row._id}&storeId=${store.storeId}`;
                    this.qrShow = true;
                  }
                }
              }, "预览"),
            );
            return elms;
          }
        });
      }
      return {
        permiss,
        queryShow: false,
        qrShow: false,
        qrUrl: "",
        defaultParams: {
          storeId: this.$storage.get("STORE").storeId
        },
        params: {},
        queryData: [
          { 
            type: "select",
            key: "type", 
            label: "项目类型", 
            holder: "请选择项目类型",
            data: platformProjectTypes
          }, 
          { 
            type: "select",
            key: "status", 
            label: "项目状态", 
            holder: "请选择项目状态",
            data: platformProjectStatus
          },
          { 
            type: "multipleInput",
            label: "价格", 
            reg: "NUMBER",
            start: { key: "priceStart" },
            end: { key: "priceEnd" },
            append: "元"
          }
        ],
        columns,
        selections: [],
        onlineProjects: [], // 已上架项目id列表
      }
    },

    created () {
      this.getStoreOnlineProjects();
    },

    methods: {
      // 获取已上架列表
      async getStoreOnlineProjects () {
        this.onlineProjects = await this.$ajax.getStoreOnlineProjects();
        this.defaultParams.ids = this.onlineProjects;
        this.$refs.table.reset();
      },
      /**
       * 查询数据
       * @params {object} params 返回筛选对象
       */
      onQuery (params) {
        this.params = params;
        this.onTableSearch();
      },

      onSelectionChange (selections) {
        this.selections = selections;
      },

      /**
       * @param selections 已选中的列表
       * @param online 上架还是下架 true or false
       * @param multiple 是否是批量
       */
      async updateStatus (selections, online, multiple) {
        let ids = selections.map(elm => elm._id); // 已选择的id列表
        let onlinePlatformProjects = [];  // 要更新的id列表
        if (online) { // 上架
          onlinePlatformProjects = JSON.parse(JSON.stringify(this.onlineProjects));
          ids.forEach(elm => {
            // 如果选择的id列表里面不在已上架列表里面，则添加到新列表里面去
            if (this.onlineProjects.indexOf(elm) < 0) onlinePlatformProjects.push(elm);
          });
        } else { // 下架
          // 如果选择的id列表里面已经在上架列表里面，则删除他
          let onlineProjects = JSON.parse(JSON.stringify(this.onlineProjects));
          ids.forEach(elm => {
            let index = onlineProjects.indexOf(elm);
            if (index >= 0) onlineProjects.splice(index, 1);
          });
          onlinePlatformProjects = onlineProjects;
        }
        let tip = "项目";
        if (multiple) tip += "批量";
        tip += online ? "上架" : "下架";
        try {
          let res = await this.$ajax.setPlatformProjectStatus({ onlinePlatformProjects });
          this.$Message.success({
            content: tip + "成功"
          });
          this.getStoreOnlineProjects();
        } catch (e) {
          this.$Message.success({
            content: tip + "失败"
          });
          console.log(e);
        };
      }
    }
  }
</script>

<style lang="less">
  .qr-dialog {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.5);
    .dialog-content {
      width: 260px;
      padding-bottom: 24px;
      background: white;
      border-radius: 5px;
      overflow: hidden;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .dialog-title {
      text-align: right;
      line-height: 40px;
      background: #f0f0f0;
      .ivu-icon {
        padding: 10px;
        cursor: pointer;
      }
    }
    .dialog-text {
      text-align: center;
      color: #332e29;
      font-size: 14px;
      margin: 20px 0 10px;
    }
    .qr-wrap {
      text-align: center;
    }
  }
</style>
