<template>
  <!-- 配件 - 配件资料 -->
  <div>
    <saas-bread title="配件资料">
      <template slot="actions">
        <div class="flex ac" >
          <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
          <Button v-if="permissionData.category" type="error" to="/inventory/maintain/category">
            <i class="iconfont icon-leibieguanli left-icon"></i>
            <span>类别管理</span>
          </Button>
          <Button v-if="permissionData.create" type="error" to="/inventory/maintain/add?partNo=create">
            <i class="iconfont icon-xinzeng left-icon"></i>
            <span>新建维修配件</span>
          </Button>
          <Button v-if="permissionData.import" type="error" @click="openUploadDialog">
            <i class="iconfont icon-shangchuan left-icon"></i>
            <span>批量导入</span>
          </Button>
          <Button v-if="canSync" type="error" @click="openSyncRemind">
            <i class="iconfont icon-yun left-icon"></i>
            <span>同步配件</span>
          </Button>
          <saas-store-select v-model="isSelfStore" @on-change="changeStore"/>
        </div>
      </template>
    </saas-bread>

    <!-- 筛选表单 -->
    <saas-query 
      ref="query"
      v-show="queryShow"
      class="mb-20" 
      query-class="column-3"
      :loading="loading"
      :data="queryData"
      :auto="false"
      @on-query="onQuery"
      @on-reset="onQuery">
    </saas-query>
    
    <div class="catetable-wrap">
      <!-- 分类列表 -->
      <div class="catetable-left">
        <div class="catetable-left__title">配件类别</div>
        <Tree class="catetable-left__list" :data="cateList" @on-select-change="onCategoryChange" ></Tree>
        <Spin size="large" fix v-if="loading && !isSetCateValue"></Spin>
      </div>

      <div class="catetable-right">
        <!-- 表格数据 -->
        <saas-table
          ref="table"
          api="getMaintainList"
          :auto="true"
          :can-delete="true"
          :columns="columns"  
          :params="params"
          @on-success="onTableSuccess"
          @on-loading-change="onLoadingChange"
          @on-multiple-delete="onMultipleDelete">
        </saas-table>
        <Spin size="large" fix v-if="loading"></Spin>
      </div>
    </div>

    <!-- 配件删除弹窗 -->
    <remind-modal title="删除配件"
      ref="delRemind"
      :content="deleteContent"
      @on-ok="deleteRemindConfirm">
    </remind-modal>

    <!-- 同步配件弹窗 -->
    <remind-modal 
      ref="syncRemind"
      title="同步配件"
      content="该操作会把总店不同的配件资料添加至当前门店，是否立即同步？"
      @on-ok="syncRemindConfirm">
    </remind-modal>

    <!-- 批量导入弹窗 -->
    <upload-dialog 
      ref="uploadDialog" 
      templateName="批量导入配件模板.xlsx"
      :action="action"
      @on-cancel="onTableSearch">
    </upload-dialog>

    <!-- 同步配件提示弹窗 -->
    <transition name="fade">
      <div class="sync-modal-wrap" v-if="syncDialogShow">
        <div class="sync-modal">
          <img class="sync-modal__img" src="/images/synchronization_pic_popup@2x.png" alt="同步配件">
          <p class="sync-modal__title">检测到已关联总店</p>
          <p class="sync-modal__title">是否立即同步配件资料</p>
          <i-button class="sync-modal__btn sync-modal__confirm" type="primary" @click="openSyncRemind">立即同步</i-button>
          <i-button class="sync-modal__btn sync-modal__cancel" type="text" @click="closeSyncModal">暂不设置</i-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>

import partInputs from "@/commons/inputs/part-input";                       // 筛选列 -> 配件
import commonColumns from "@/commons/columns/common-column";                // 表格的列 -> 公共 
import partColumns from "@/commons/columns/part-column";                    // 表格的列 -> 配件

import { formatCategoryData } from "@/commons";                             // 公共方法

import RemindModal from "@/components/dialog/remind-dialog";                // 删除配件确认弹窗 同步配件确认弹窗
import UploadDialog from "@/components/dialog/upload-dialog";               // 批量导入弹窗
import { getUri } from "@/https/api.js";

export default {
  name: "MaintainList",
  components: { RemindModal, UploadDialog },
  data () {
    let permissionData = this.$permission.data.inventoryMaintain;
    let columns = [
      commonColumns.selection({fixed: "left"}),                             // checkbox
      commonColumns.index(),                                                // 序号
      partColumns.partNo(),                                                 // 配件编码
      partColumns.partImg(),                                                // 配件图片
      partColumns.partFactoryNo(),                                          // 原厂编码
      partColumns.partName(),                                               // 配件名称
      partColumns.partBrand(),                                              // 配件品牌
      partColumns.partCate(),                                               // 配件分类
      partColumns.partUnit(),                                               // 配件单位
      partColumns.purchasePrice({ title: "进货价", sortable: "custom" }),    // 进货价
      partColumns.retailPrice({ sortable: "custom" }),                      // 零售价
      { 
        title: "操作",
        width: 90,
        fixed: "right",
        render: (h, { row }) => {
          let elms = [];
          if(this.isSelfStore){
            if (permissionData.update) {
              elms.push(h("Button", {
                props: { 
                  type: "text",
                  to: "/inventory/maintain/add?partNo=" + row.partNo
                },
                style: { marginRight: "10px" }
              }, "编辑"));
            }
  
            if (permissionData.delete && (row.hasInventory == 0 && !row.isUsed)) {
              elms.push(h("Button", {
                props: { type: "text" },
                on: {
                  click: () => {
                    this.partNoList = [row.partNo];
                    this.deleteContent = "确认要删除这1项配件吗？";
                    this.$refs.delRemind.openModal();
                  }
                }
              }, "删除"));
            }
          }else{
            elms.push(h("span","--"));
          }
          return elms;
        }
      }
    ];
    if (!permissionData.delete) columns.shift();
    if (!permissionData.delete && !permissionData.update) columns.pop();
    return {
      permissionData,
      action: getUri("repairUpload"),
      deleteContent: "",
      
      loading: false,
      canSync: false,                                             // 是否可以同步配件
      ignoreSync: false,                                          // 是否忽略同步,默认不忽略，点击暂不设置的时候忽略
      syncDialogShow: false,                                      // 是否显示同步配件弹窗
      queryShow: false,                                           // 是否显示表单
      isSetCateValue: false,                                      // 是否设置过分类的数量，设置过不需要重新设置
      params: {
        shareStoreId:''
      },                                                 // 筛选参数
      categoryCode: "",                                           // 分类code
      cateList: [],                                               // 分类列表
      partNoList: [],                                             // 选中要删除的配件编号数组
      queryData: [
        partInputs.partFactoryNo(),                               // 原厂编码
        partInputs.partName(),                                    // 配件名称
        partInputs.partBrand(),                                   // 配件品牌
      ],
      columns,
      storeDetail: {},                                            // 门店详情
      isSelfStore:true
    }
  },

  created () {
    this.testingPart(); // 检测配件是否需要同步
  },

  methods: {
    changeStore(id){
      this.params.shareStoreId = id
      this.$refs.table.reset();
    },
    // 检测是否同步配件
    async testingPart () {
      this.storeDetail = this.$storage.get("STORE");
      // 总店的话不显示同步按钮，并且不弹出弹窗，分店显示
      if (!this.storeDetail.isMasterStore) {
        this.canSync = true;
        let data = await this.$ajax.getCompontentSyncStatus();
        this.syncDialogShow = data.canSync;
      }
    },

    // 表格数据获取成功 groupData数据是固定的，所以分类数据设置一次就可以
    async onTableSuccess (data) {
      if (this.isSetCateValue) return;
      this.isSetCateValue = true;
      let cateList = await this.$ajax.getRepairCateList.call(this, { includeOther: 1 });  // 获取分类列表
      this.cateList = formatCategoryData(cateList, data.groupData, "全部配件"); // 格式化分类数据
    },

    // 返回table中loading的状态
    onLoadingChange (loading) {
      this.loading = loading;
    },

    // 设置参数筛选数据
    onTableSearch () {
      let params = this.params;
      params.code = this.categoryCode;
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

    /**
     * 分类选择
     * @param { array } nodes 列表选中的时候返回的子节点数据列表
     */
    onCategoryChange (nodes) {
      this.categoryCode = nodes[0].code;
      this.onTableSearch();
    },

    // 批量删除
    onMultipleDelete (selection) {
      // 需要传一个配件编码数组删除
      this.partNoList = selection.map(elm => elm.partNo);
      this.deleteContent = "确认要删除所选配件吗？";
      this.$refs.delRemind.openModal();
    },

    // 批量导入弹窗
    openUploadDialog () {
      this.$refs.uploadDialog.openModal();
    },

    // 确认删除
    async deleteRemindConfirm () {
      let { partNoList } = this;
      try {
        let res = await this.$ajax.deleteComponents({ partNoList });
        this.$Message.success({
          content: "删除成功",
          onClose: this.onTableSearch
        });
      } catch (error) {
        console.log(error);
      }
      this.$refs.delRemind.onCancel();
    },

    // 暂不设置
    closeSyncModal () {
      this.ignoreSync = true;
      this.syncDialogShow = false;
      this.syncRemindConfirm();
    },

    // 立即设置
    openSyncRemind () {
      this.syncDialogShow = false;
      this.$refs.syncRemind.openModal();
    },

    // 同步配件确认
    async syncRemindConfirm () {
      let { ignoreSync } = this;
      try {
        let data = await this.$ajax.syncComponents({ ignoreSync });
        // 忽略同步的时候，不弹出
        if (!ignoreSync) {
          this.$Message.success({
            content: "同步成功",
            onClose: this.onTableSearch
          });
        }
        this.onTableSearch(); // 同步成功重新获取数据
      } catch (error) {
        console.log(error);
      }
      this.$refs.syncRemind.onCancel();
    }
  }
}
</script>

<style lang="less" scoped>
  // 同步配件弹窗
  .sync-modal-wrap {
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    .sync-modal {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
      background: white;
      text-align: center;
      font-family: PingFangSC-Regular,PingFang SC;
      border-radius: 10px;
      overflow: hidden;
      width: 240px;
      height: 294px;
      line-height: 1;
      padding-top: 30px;
      &__img {
        width: 100px;
        height: 100px;
        margin: 0 auto 16px;
      }
      &__title {
        font-size: 14px;
        font-weight: 400;
        color: rgba(51,46,41,1);
        line-height: 22px;
      }
      &__btn {
        display: block;
        margin: auto;
      }
      &__confirm {
        width: 150px;
        height: 34px;
        margin-top: 20px;
        margin-bottom: 10px;
        border-radius: 2px;
      }
      &__cancel {
        font-weight:400;
        color:rgba(191,189,186,1);
        line-height:14px;
      }
    }
  }
</style>
