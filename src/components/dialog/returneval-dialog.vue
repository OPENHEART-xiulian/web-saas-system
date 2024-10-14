<template>
  <!-- 营销/平台项目/订单列表 - 回复评价 -->
  <Modal v-model="show" title="用户评价 " class="w-dialog" :closable="true" width="800">
    <div class="top-list">
      <!-- <div class="top-list__item">客户名称：{{ detailData.contact }}</div> -->
      <div class="top-list__item">联系方式：{{ detailData.mobile }}</div>
      <!-- <div class="top-list__item">车牌号：{{ detailData.plateNo }}</div> -->
      <div class="top-list__item">订单编号：{{ detailData.orderId }}</div>
      <div class="top-list__item">下单日期：{{ detailData.payTime }}</div>
      <div class="top-list__item">支付方式：微信支付</div>
    </div>

    <Form ref="form" :model="formData" :rules="rules" label-position="left" class="center-list">
      <FormItem label="用户评分：" class="center-item">
        <Rate disabled :value="detailData.userGrade" />
      </FormItem>
      <FormItem label="客户评价：" :class="['center-item', { start: !!detailData.imgIds.length }]">
        <span class="center-item__value">{{ detailData.content }}</span>
        <div class="comment-img" v-if="detailData.imgIds.length > 0">
          <div class="comment-img__item" v-for="(imgId, cIndex) in detailData.imgIds" :key="cIndex">
            <my-img :src="BASE_IMG_URL + imgId" :alt="imgId"></my-img>
          </div>
        </div>
      </FormItem>
      <FormItem label="评价回复：" prop="content" class="center-item center-input">
        <Input v-model="formData.content" :rows="4" maxlength="50" type="textarea" placeholder="请输入回复内容" />
      </FormItem>
    </Form>
    <Spin fix v-if="loading"></Spin>
    <div slot="footer">
      <Button type="default" size="large" :loading="btnLoading" @click.native.stop="close">取消</Button>
      <Button type="primary" size="large" :loading="btnLoading" @click.native.stop="submit">确定</Button>
    </div>
  </Modal>
</template>

<script>
import '@/styles/components/dialog.less';
import { BASE_IMG_URL } from "@/https/api";
export default {
  data () {
    return {
      BASE_IMG_URL,
      show: false,
      loading: false,
      btnLoading: false,
      id: "",
      detailData: {
        imgIds: []
      },
      formData: {
        content: ""
      },
      rules: {
        content: [
          { required: true, message: '请输入回复内容', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    open (row) {
      this.show = true;
      if (row._id == this.id) return;
      this.id = row._id;
      this.getData(this.id);
    },

    async getData (id) {
      this.loading = true;
      let data = await this.$ajax.getPlatformProjectOrderDetail({ id });
      let comment = data.comments[0];
      data.userGrade = comment.userGrade;
      data.content = comment.content;
      data.imgIds = comment.imgIds || [];
      this.detailData = data;
      this.formData = {
        commentId: comment._id,
        replyId: comment._id,
        replyType: "comment",
        fromUserType: "business",
        content: "",
        fromUid: "user1",
        toUid: "user2",
      };
      this.loading = false;
    },

    close () {
      this.show = false;
    },

    async submit () {
      let valid = false;
      this.$refs.form.validate(v => {
        if (v) valid = v;
      });
      if (!valid) return;
      this.btnLoaidng = true;
      try {
        let data = await this.$ajax.platformProjectCommentReply(this.formData);
        this.close();
        this.$Message.success("回复成功");
        this.$emit("on-success", data);
      } catch (e) {
        this.$Message.error("回复失败");
      }
      this.btnLoaidng = false;
    }
  }
}
</script>

<style lang="less" scoped>
  .w-dialog {
    .top-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #E5E2DF;
      margin-bottom: 20px;
      &__item {
        width: 33.33%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular,PingFang SC;
        font-weight: 400;
        color: rgba(51,46,41,1);
        margin-bottom: 10px;
      }
    }

    .center-list {
      .center-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        width: 100%;
        &.start {
          align-items: flex-start;
          /deep/ .ivu-form-item-label {
            position: relative;
            top: 2px;
            min-width: 70px;
          }
        }
        &__label, &__value {
          height: 20px;
          line-height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular,PingFang SC;
          font-weight: 400;
          color: rgba(51,46,41,1);
        }
        &__label {
          min-width: 70px;
        }

        .comment-img {
          display: flex;
          flex-wrap: wrap;
          width: 330px;
          &__item {
            width: 100px;
            height: 100px;
            margin-right: 10px;
            margin-bottom: 10px;
            img {
              width: inherit;
              height: inherit;
            }
          }
        }

        &.center-input {
          align-items: flex-start;
          margin-top: 20px;
        }
      }
    }
    /deep/ .ivu-form .ivu-form-item-label {
      padding: 0;
    }
    /deep/ .ivu-form-item-required .ivu-form-item-label:before {
      display: none;
    }
    /deep/ .ivu-form .ivu-form-item-content {
      flex-grow: 1;
      line-height: unset;
    }
  }
</style>
