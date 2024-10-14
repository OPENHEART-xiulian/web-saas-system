<template>
  <!-- 回访登记弹窗 -->
  <Modal :title="detail.status == 0 ? '回访登记' : '回访记录'" v-model="modal" class="w-dialog revisit-dialog" width="800">
    <!-- 客户信息 -->
    <div class="modal-top">
      <div class="modal-top__item">
        <span class="modal-top__label">客户名称：</span>
        <span class="modal-top__value">{{detail.name | emptyText}}</span>
      </div>
      <div class="modal-top__item">
        <span class="modal-top__label">联系方式：</span>
        <span class="modal-top__value">{{detail.mobile | emptyText}}</span>
      </div>
      <div class="modal-top__item">
        <span class="modal-top__label">车牌号：</span>
        <span class="modal-top__value">{{detail.plateNo | emptyText}}</span>
      </div>
      <div class="modal-top__item">
        <span class="modal-top__label">工单号：</span>
        <span class="modal-top__value">{{detail.statementNo | emptyText}}</span>
      </div>
      <div class="modal-top__item">
        <span class="modal-top__label">计划回访日期：</span>
        <span class="modal-top__value">{{detail.planReturnVisitAt | formatDate}}</span>
      </div>
      <div class="modal-top__item">
        <span class="modal-top__label">实际回访日期：</span>
        <span class="modal-top__value">{{formData.returnVisitAt | formatDate}}</span>
      </div>
    </div>
    <!-- 分割线 -->
    <Divider />

    <!-- form 未回访状态的时候显示表单 -->
    <Form v-if="detail.status == 0" ref="form" class="modal-form" :model="formData" :rules="rules" label-position="top">
      <FormItem class="modal-form__item" label="回访方式：" prop="type">
        <i-select v-model="formData.type" placeholder="请选择总体评价">
          <i-option v-for="(item, index) in returnVisitType" :key="index" :value="item.value">{{item.label}}</i-option>
        </i-select>
      </FormItem>
      <FormItem class="modal-form__item" label="总体评价：" prop="rate">
        <i-select v-model="formData.rate" placeholder="请选择总体评价">
          <i-option v-for="(item, index) in returnVisitRate" :key="index" :value="item.value">{{item.label}}</i-option>
        </i-select>
      </FormItem>
      <FormItem class="modal-form__item" label="回访人：" prop="returnVisitUserId">
        <i-select v-model="formData.returnVisitUserId" placeholder="请选择回访人">
          <i-option v-for="(item, index) in returnVisitUsers" :key="index" :value="item.value">{{item.label}}</i-option>
        </i-select>
      </FormItem>
      
      <FormItem class="modal-form__item block-wrap" label="不满因素：">
        <CheckboxGroup class="checkbox-group" v-model="formData.dissatisfiedReason">
          <Checkbox v-for="(item, index) in returnVisitCause" :key="index" :label="item.value">{{ item.label }}</Checkbox>
        </CheckboxGroup>
      </FormItem>
      
      <FormItem class="modal-form__item area-wrap" label="客户建议：">
        <i-input v-model="formData.advice" type="textarea" :rows="2" :maxlength="300" placeholder="请输入客户建议"></i-input>
      </FormItem>
      
      <FormItem class="modal-form__item area-wrap" label="备注：">
        <i-input v-model="formData.remark" type="textarea" :rows="2" :maxlength="300" placeholder="请输入备注"></i-input>
      </FormItem>
    </Form>
    <!-- 已回访显示详情 -->
    <div v-else-if="detail.status == 1" class="detail-list">
      <div class="list-item-wrap">
        <div class="detail-list__item">回访方式：{{formData.type | getTypeLabel}}</div>
        <div class="detail-list__item">总体评价：{{formData.rate | getRateLabel}}</div>
        <div class="detail-list__item">回访人：{{formData.returnVisitUserName | emptyText}}</div>
      </div>
      
      <div class="detail-list__item">
        不满因素：<span v-for="(item, index) in formData.dissatisfiedReason" :key="index">{{ item | getReturnVisitCauseLabel }} {{index + 1 == formData.dissatisfiedReason.length ? "" : "、"}}</span>
      </div>
      <div class="detail-list__item">客户建议：{{formData.advice | emptyText}}</div>
      <div class="detail-list__item">备注：{{formData.remark | emptyText}}</div>
    </div>

    <div slot="footer">
      <!-- 未回访按钮 -->
      <template v-if="detail.status == 0">
        <i-button type="text" size="large" @click="onCancel">取消</i-button>
        <i-button type="primary" size="large" :loading="loading" @click="submit">确定</i-button>
      </template>
      <!-- 已回访按钮 -->
      <i-button v-else type="default" size="large" @click="onCancel">确定</i-button>
    </div>
  </Modal>
</template>

<script>
  import mixins from './dialog.mixin.js';
  import { returnVisitCause, returnVisitType, returnVisitRate, getLabel } from "@/store/json/default";

  export default {
    mixins: [mixins],
    data () {
      return {
        loading: false,
        returnVisitRate,                // 总体评价列表
        returnVisitType,                // 回访类型列表
        returnVisitCause,               // 不满原因列表
        returnVisitUsers: [],           // 回访人列表，从父组件拿
        detail: {},                     // 回访信息，从父组件拿
        formData: {
          type: "",
          rate: "",
          returnVisitUserId: ""
        },
      
        rules: {
          type: [{ required: true, trigger: "change", message: "请选择回访类型" }],
          rate: [{ required: true, trigger: "change", message: "请选择总体评价" }],
          returnVisitUserId: [{ required: true, trigger: "change", message: "请选择回访人" }],
        }
      }
    },

    methods: {
      /**
       * @param { object } row 对应父组件表格的行的数据
       * @param { object } returnVisitUsers 父组件获取到的回访人列表
       */
      openModal (row, returnVisitUsers) {
        this.modal = true;
        this.returnVisitUsers = returnVisitUsers;
        let userId = this.$storage.get("USER").userId;
        this.detail = row;
        // 设置表单数据
        this.formData = {
          _id: row._id,                                                 // 回访记录id
          type: row.type || "",                                         // 回访类型
          rate: row.rate || "",                                         // 总体评价
          returnVisitUserId: row.returnVisitUserId || userId,           // 回访人id
          returnVisitUserName: row.returnVisitUserName || "",           // 回访人姓名
          dissatisfiedReason: row.dissatisfiedReason || [],             // 不满原因
          advice: row.advice || "",                                     // 建议
          remark: row.remark || "",                                     // 备注
          returnVisitAt: this.$moment(new Date()).format("YYYY-MM-DD"), // 回访时间
        }
      },

      submit () {
        this.$refs.form.validate(valid => {
          if (valid) this.save();
        });
      },

      async save () {
        let { formData } = this;
        let user = this.returnVisitUsers.find(elm => elm.value == formData.returnVisitUserId);
        formData.returnVisitUserName = user.label;
        this.loading = true;
        try {
          await this.$ajax.saveReturnVisit(formData);
          this.$Message.success("保存成功");
          this.modal = false;
          this.$emit("on-success");
        } catch (error) {
          console.log(error)
        }
        this.loading = false;
      }
    },

    filters: {
      getTypeLabel (to) {
        return getLabel(to, returnVisitType);
      },
      getRateLabel (to) {
        return getLabel(to, returnVisitRate);
      },
      getReturnVisitCauseLabel (to) {
        let data = returnVisitCause.find(v => v.value == to);
        return data ? data.label : "--";
      }
    }
  }
</script>

<style lang="less">
  .revisit-dialog {
    .ivu-divider-horizontal {
      margin-top: 10px;
      margin-bottom: 20px;
      background: #E5E2DF;
    }
    .ivu-modal-footer {
      padding: 0px 0px 30px;
      border-top: none;
    }
    .modal-top {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      &__item {
        width: 220px;
        margin-bottom: 10px;
        color: #4B443D;
        font-size: 14px;
      }
    }
    // 表单
    .modal-form {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .ivu-form-item-label {
        padding-right: 0;
      }
      
      &__item {
        width: 240px;
        color: #60584E;
        &.block-wrap {
          width: 100%;
        }
        &.area-wrap {
          width: 600px;
        }
        
        .ivu-form-item-label {
          position: relative;
          bottom: 1px;
        }

        .checkbox-group {
          position: relative;
          top: 1px;
          .ivu-checkbox-group-item {
            margin-right: 20px;
          }
          .ivu-checkbox-wrapper-checked.ivu-checkbox-wrapper-disabled .ivu-checkbox-inner {
            border-color: #FF8000;
            background-color: #FF8000;
            &::after {
              border-color: white;
            }
          }
        }
      }
    }
    // 详情
    .detail-list {
      &__item {
        font-size:14px;
        font-family:PingFangSC-Regular,PingFang SC;
        font-weight:400;
        color:rgba(75,68,61,1);
        line-height:20px;
        margin-bottom: 20px;
        &:last-child {
          margin-bottom: 0;
        }
      }
      .list-item-wrap {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        .detail-list__item {
          width: 220px;
          color: #4B443D;
          font-size: 14px;
        }
      }
    }
  }
</style>
