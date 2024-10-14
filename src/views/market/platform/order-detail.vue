<template>
  <div class="platform-orderdetail">
    <saas-bread title="订单详情">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
      </template>
    </saas-bread>
    <div class="info">
      <div class="info__left">
        <span>订单编号：{{ detailData.orderId }}</span>
        <span class="line">|</span>
        <span>下单时间：{{ detailData.payTime }}</span>
        <span class="line">|</span>
        <span>支付方式：微信支付</span>
      </div>
      <div class="info__right">
        <span class="label">订单金额：</span>
        <span class="value">￥{{ detailData.totalCost | toFixed }}</span>
      </div>
    </div>

    <div class="content">
      <div class="content__title">客户信息</div>
      <div class="content__detail customer-info">
        <!-- <span>客户名称：{{ detailData.contact }}</span> -->
        <span>联系电话：{{ detailData.mobile }}</span>
        <!-- <span>车牌号码 ：{{ detailData.plateNo }}</span> -->
      </div>
    </div>

    <div class="content" v-if="detailData.comments && detailData.comments.length">
      <div class="content__title">用户评价</div>
      <div class="content__detail">
        <div class="comment-item" v-for="(comment, index) in detailData.comments" :key="index">
          <div class="comment-top">
            <i class="iconfont icon-yanzhengma"></i>
            <span class="label">评价内容：</span>
            <span class="date">{{ comment.created | formatDateTime }}</span>
            <Rate disabled :value="comment.userGrade" />
          </div>
          <div class="comment-info" v-if="comment.content">{{ comment.content }}</div>
          <div class="comment-img" v-if="comment.imgIds.length">
            <div class="comment-img__item" v-for="(imgId, cIndex) in comment.imgIds" :key="cIndex">
              <my-img :src="BASE_IMG_URL + imgId" :alt="imgId"></my-img>
            </div>
          </div>
          <div class="reply-list" v-if="comment.children.length">
            <div class="reply-item" v-for="(item, cIndex) in comment.children" :key="cIndex">
              <div class="reply-item__top">
                <span class="label">{{ item.fromUserType == "business" ? "评价回复" : "平台回复" }}：</span>
                <span class="date">{{ item.created | formatDateTime }}</span>
              </div>
              <div class="reply-item__info">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { BASE_IMG_URL } from "@/https/api";
  export default {
    data () {
      return {
        BASE_IMG_URL,
        detailData: {
          rate: 3,
        }
      }
    },

    created () {
      this.getData();
    },

    methods: {
      async getData () {
        let data = await this.$ajax.getPlatformProjectOrderDetail({ id: this.$route.query.id });
        this.detailData = data;
      }
    }
  }
</script>

<style lang="less" scoped>
  .platform-orderdetail {
    // 最上面
    .info {
      background: white;
      padding: 15px 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular,PingFang SC;
      font-weight: 400;
      color: rgba(128,125,124,1);
      line-height: 20px;
      display: flex;
      &__left {
        flex-grow: 1;
        align-items: center;
        .line {
          margin: 0 12px;
          position: relative;
          top: -1px;
        }
      }
      &__right {
        .label {
          font-size: 14px;
          font-family: PingFangSC-Medium,PingFang SC;
          font-weight: 500;
          color: rgba(51,46,41,1);
          line-height: 20px;
        }
        .value {
          font-size: 14px;
          font-family: PingFangSC-Medium,PingFang SC;
          font-weight: 500;
          color: rgba(242,45,0,1);
          line-height: 20px;
        }
      }
    }

    // 中间
    .content {
      background: white;
      margin-top: 20px;
      &__title {
        height: 40px;
        line-height: 40px;
        background: rgba(252,251,250,1);
        font-size: 14px;
        font-family: PingFangSC-Medium,PingFang SC;
        font-weight: 500;
        color: rgba(51,46,41,1);
        padding: 0 20px;
      }
      &__detail {
        padding: 15px 20px;
      }
    }

    .customer-info {
      span {
        font-size: 14px;
        font-family: PingFangSC-Regular,PingFang SC;
        font-weight: 400;
        color: rgba(128,125,124,1);
        line-height: 20px;
        margin-right: 40px;
      }
    }

    .comment-item {
      padding-left: 20px;
      margin-bottom: 20px;
      .comment-top {
        display: flex;
        margin-bottom: 10px;
        height:20px;
        align-items: center;
        .iconfont {
          font-size: 14px;
          margin-right: 6px;
        }
        .label {
          font-size: 14px;
          font-family: PingFangSC-Regular,PingFang SC;
          font-weight: 400;
          color: rgba(51,46,41,1);
          margin-right: 20px;
        }
        .date {
          flex-grow: 1;
          font-size: 12px;
          font-family: PingFangSC-Regular,PingFang SC;
          font-weight: 400;
          color: rgba(191,189,186,1);
        }
        .ivu-rate {
          font-size: 18px;
        }
      }

      .comment-info {
        font-size: 14px;
        font-family: PingFangSC-Regular,PingFang SC;
        font-weight: 400;
        color: rgba(51,46,41,1);
        line-height: 20px;
        margin-bottom: 10px;
      }

      .comment-img {
        display: flex;
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

      .reply-list {
        padding: 10px 20px;
        background:rgba(252,251,250,1);

        .reply-item {
          &__top {
            display: flex;
            line-height: 20px;
            align-items: center;
            margin-bottom: 6px;
            .label {
              font-size: 14px;
              font-family: PingFangSC-Regular,PingFang SC;
              font-weight: 400;
              color: rgba(255,128,0,1);
              margin-right: 20px;
            }
            .date {
              font-size: 12px;
              font-family: PingFangSC-Regular,PingFang SC;
              font-weight: 400;
              color: rgba(191,189,186,1);
            }
          }
          &__info {
            font-size: 14px;
            font-family: PingFangSC-Regular,PingFang SC;
            font-weight: 400;
            color: rgba(98,95,94,1);
            line-height: 20px;
            margin-bottom: 20px;
          }
        }
      }
    }
  }
</style>
